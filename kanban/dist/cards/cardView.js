export function toCardViewModel(card, columnName) {
    const priorityBadgeClass = card.priority === 'alta'
        ? 'bg-red-100 text-red-700 border-red-200'
        : card.priority === 'média'
            ? 'bg-amber-100 text-amber-700 border-amber-200'
            : 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return {
        id: card.id,
        title: card.title,
        description: card.description,
        priority: card.priority,
        priorityBadgeClass,
        columnId: card.columnId,
        columnName,
    };
}
