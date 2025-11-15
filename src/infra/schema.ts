import { sqliteTable, text, int } from 'drizzle-orm/sqlite-core';

export const usersSchema = sqliteTable('users', {
  id: int('id').primaryKey({ autoIncrement: true }).notNull(),
  email: text('email', { length: 255 }).unique().notNull(),
  password: text('password', { length: 255 }).notNull(),
});

export const todoListSchema = sqliteTable('todo_list', {
  id: int('id').primaryKey({ autoIncrement: true }).notNull(),
  user_id: int('user_id')
    .references(() => usersSchema.id)
    .notNull(),
  title: text('title', { length: 60 }).notNull(),
  description: text('title', { length: 255 }).notNull(),
  status: text({ enum: ['TODO', 'DOING', 'DONE'] })
    .default('TODO')
    .notNull(),
  created_at: text('created_at').default(
    new Date().toLocaleDateString('pt-br'),
  ),
  updated_at: text('updated_at').default(
    new Date().toLocaleDateString('pt-br'),
  ),
});
