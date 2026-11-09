export const positions = ['Аналитик', 'Старший аналитик', 'Ведущий аналитик', 'Руководитель аналитики', 'Менеджер'] as const;
export type UserProfile = { id: string; fullName: string; email: string; position: string };
