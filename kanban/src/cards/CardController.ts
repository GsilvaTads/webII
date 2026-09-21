import type { CardRepository } from './CardRepository.js';
import type { ColumnChecker } from './ColumnChecker.js';
import { type ControllerResult, redirect } from '../shared/http.js';
import { Card, type CardPriority } from './Card.js';
import { ColumnNotFoundError } from '../boards/errors.js';
import { CardNotFoundError, WipLimitExceededError, DuplicateCardTitleError } from './errors.js';
import { toCardViewModel } from './cardView.js';

interface CreateCardBody {
  title?: string;
  columnId?: string;
  priority?: CardPriority | string;
  description?: string;
  returnUrl?: string;
}

interface MoveCardBody {
  columnId?: string;
  returnUrl?: string;
}

interface UpdateCardBody {
  title?: string;
  description?: string;
  priority?: CardPriority | string;
  returnUrl?: string;
}

interface SearchQuery {
  query?: string;
}

export class CardController {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly columnChecker: ColumnChecker,
  ) {}

  create(body: unknown): ControllerResult {
    const { title, columnId, priority, description, returnUrl } = (body ?? {}) as CreateCardBody;

    const targetColumnId = columnId ?? '';
    if (!this.columnChecker.hasColumn(targetColumnId)) {
      throw new ColumnNotFoundError(targetColumnId);
    }

    const normalizedTitle = (title ?? '').trim();

    if (this.cardRepository.existsWithTitleInColumn(normalizedTitle, targetColumnId)) {
      throw new DuplicateCardTitleError(normalizedTitle, targetColumnId);
    }

    const normalizedPriority: CardPriority =
      priority === 'baixa' || priority === 'média' || priority === 'alta'
        ? priority
        : 'baixa';

    const card = Card.create(
      normalizedTitle,
      targetColumnId,
      normalizedPriority,
      description ?? '',
    );
   
    
    this.cardRepository.save(card);

    return redirect(returnUrl ?? '/');
  }

  move(id: string, body: unknown): ControllerResult {
    const { columnId, returnUrl } = (body ?? {}) as MoveCardBody;
    const targetColumnId = columnId ?? '';

    const card = this.cardRepository.findById(id);
    if (!card) {
      throw new CardNotFoundError(id);
    }

    const colInfo = this.columnChecker.getColumnInfo(targetColumnId);
    if (!colInfo) {
      throw new ColumnNotFoundError(targetColumnId);
    }

    if (colInfo.wipLimit !== null) {
      const cardsInTarget = this.cardRepository.findByColumn(targetColumnId);
      if (cardsInTarget.length >= colInfo.wipLimit) {
        throw new WipLimitExceededError(colInfo.name, colInfo.wipLimit);
      }
    }

    card.changeColumn(targetColumnId);
    this.cardRepository.save(card);

    return redirect(returnUrl ?? '/');
  }

  update(id: string, body: unknown): ControllerResult {
    const card = this.cardRepository.findById(id);
    if (!card) {
      throw new CardNotFoundError(id);
    }

    const { title, description, priority, returnUrl } = (body ?? {}) as UpdateCardBody;

    if (title !== undefined) {
      const normalizedTitle = title.trim();
      if (
        normalizedTitle !== card.title &&
        this.cardRepository.existsWithTitleInColumn(normalizedTitle, card.columnId)
      ) {
        throw new DuplicateCardTitleError(normalizedTitle, card.columnId);
      }
      card.rename(normalizedTitle, description);
    } else if (description !== undefined) {
      card.rename(card.title, description);
    }

    if (priority !== undefined) {
      card.changePriority(priority as CardPriority);
    }

    this.cardRepository.save(card);

    return redirect(returnUrl ?? '/');
  }

  remove(id: string, body?: unknown): ControllerResult {
    const { returnUrl } = (body ?? {}) as { returnUrl?: string };

    const card = this.cardRepository.findById(id);
    if (!card) {
      throw new CardNotFoundError(id);
    }

    this.cardRepository.delete(id);

    return redirect(returnUrl ?? '/');
  }

  showDetail(id: string): ControllerResult {
    const card = this.cardRepository.findById(id);
    if (!card) {
      throw new CardNotFoundError(id);
    }

    const colInfo = this.columnChecker.getColumnInfo(card.columnId);
    const columnName = colInfo ? colInfo.name : 'Coluna Desconhecida';

    const cardView = toCardViewModel(card, columnName);

    return {
      status: 200,
      view: 'cards/show',
      locals: {
        card: cardView,
      },
    };
  }

  search(query: unknown): ControllerResult {
    const { query: searchTerm } = (query ?? {}) as SearchQuery;
    const term = (searchTerm ?? '').trim().toLowerCase();

    const allCards = this.cardRepository.findAll();
    const filteredCards = term === ''
      ? allCards
      : allCards.filter((c) => c.title.toLowerCase().includes(term));

    const cardsView = filteredCards.map((card) => {
      const colInfo = this.columnChecker.getColumnInfo(card.columnId);
      const columnName = colInfo ? colInfo.name : 'Coluna Desconhecida';
      return toCardViewModel(card, columnName);
    });

    return {
      status: 200,
      view: 'cards/search',
      locals: {
        query: searchTerm ?? '',
        cards: cardsView,
      },
    };
  }
}