import { redirect } from '../shared/http.js';
import { Card } from './Card.js';
import { ColumnNotFoundError } from '../boards/errors.js';
import { CardNotFoundError, WipLimitExceededError, DuplicateCardTitleError } from './errors.js';
import { toCardViewModel } from './cardView.js';
export class CardController {
    constructor(cardRepository, columnChecker) {
        this.cardRepository = cardRepository;
        this.columnChecker = columnChecker;
    }
    create(body) {
        const { title, columnId, priority, description, returnUrl } = (body ?? {});
        const targetColumnId = columnId ?? '';
        if (!this.columnChecker.hasColumn(targetColumnId)) {
            throw new ColumnNotFoundError(targetColumnId);
        }
        const normalizedTitle = (title ?? '').trim();
        if (this.cardRepository.existsWithTitleInColumn(normalizedTitle, targetColumnId)) {
            throw new DuplicateCardTitleError(normalizedTitle, targetColumnId);
        }
        const normalizedPriority = priority === 'baixa' || priority === 'média' || priority === 'alta'
            ? priority
            : 'baixa';
        const card = Card.create(normalizedTitle, targetColumnId, normalizedPriority, description ?? '');
        this.cardRepository.save(card);
        return redirect(returnUrl ?? '/');
    }
    move(id, body) {
        const { columnId } = (body ?? {});
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
        return redirect('/');
    }
    update(id, body) {
        const card = this.cardRepository.findById(id);
        if (!card) {
            throw new CardNotFoundError(id);
        }
        const { title, description, priority, returnUrl } = (body ?? {});
        if (title !== undefined) {
            const normalizedTitle = title.trim();
            if (normalizedTitle !== card.title &&
                this.cardRepository.existsWithTitleInColumn(normalizedTitle, card.columnId)) {
                throw new DuplicateCardTitleError(normalizedTitle, card.columnId);
            }
            card.rename(normalizedTitle, description);
        }
        else if (description !== undefined) {
            card.rename(card.title, description);
        }
        if (priority !== undefined) {
            card.changePriority(priority);
        }
        this.cardRepository.save(card);
        return redirect(returnUrl ?? '/');
    }
    remove(id) {
        const card = this.cardRepository.findById(id);
        if (!card) {
            throw new CardNotFoundError(id);
        }
        this.cardRepository.delete(id);
        return redirect('/');
    }
    showDetail(id) {
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
    search(query) {
        const { query: searchTerm } = (query ?? {});
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
