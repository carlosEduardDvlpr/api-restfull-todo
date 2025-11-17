import { sqliteTable, text, int } from 'drizzle-orm/sqlite-core';

export const usersSchema = sqliteTable('users', {
  id: int('id').primaryKey({ autoIncrement: true }).notNull(),
  email: text('email', { length: 255 }).unique().notNull(),
  password: text('password', { length: 255 }).notNull(),
});

export const tasksSchema = sqliteTable('tasks', {
  id: int('id').primaryKey({ autoIncrement: true }).notNull(),
  user_id: int('user_id')
    .references(() => usersSchema.id)
    .notNull(),
  title: text('title', { length: 60 }).notNull(),
  description: text('description', { length: 255 }).notNull(),
  status: text({ enum: ['TODO', 'DONE'] })
    .default('TODO')
    .notNull(),
  created_at: text('created_at').default(
    new Date().toLocaleString('pt-br', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
  ),
  updated_at: text('updated_at'),
});
