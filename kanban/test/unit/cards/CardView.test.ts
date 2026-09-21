import { describe, expect, it } from 'vitest';
import { Card } from '../../../src/cards/Card.js';
import { toCardViewModel } from '../../../src/cards/cardView.js';

describe('cardView', () => {
  it('converte um cartão para o modelo de visualização com badges adequadas', () => {
    const cardAlta = Card.create('Título', 'col-1', 'alta', 'Desc');
    const vmAlta = toCardViewModel(cardAlta, 'A Fazer');
    expect(vmAlta.priorityBadgeClass).toContain('text-red-700');
    expect(vmAlta.columnName).toBe('A Fazer');

    const cardMedia = Card.create('Título', 'col-1', 'média');
    const vmMedia = toCardViewModel(cardMedia, 'Em Andamento');
    expect(vmMedia.priorityBadgeClass).toContain('text-amber-700');

    const cardBaixa = Card.create('Título', 'col-1', 'baixa');
    const vmBaixa = toCardViewModel(cardBaixa, 'Concluído');
    expect(vmBaixa.priorityBadgeClass).toContain('text-emerald-700');
  });
});