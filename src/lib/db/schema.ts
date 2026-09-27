import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { pgTable, text, integer, timestamp, varchar, index } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: text('name'),
  email: text('email'),
  image: text('image'),
  discordId: varchar('discord_id', { length: 255 }).notNull().unique(),
  discriminator: varchar('discriminator', { length: 10 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  discordIdIdx: index('users_discord_id_idx').on(table.discordId),
}));

export const reflexScores = pgTable('reflex_scores', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  userName: text('user_name').notNull(),
  userAvatar: text('user_avatar'),
  reactionTime: integer('reaction_time').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('reflex_scores_user_id_idx').on(table.userId),
  reactionTimeIdx: index('reflex_scores_reaction_time_idx').on(table.reactionTime),
}));

export const galleryImages = pgTable('gallery_images', {
  id: varchar('id', { length: 255 }).primaryKey(),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  title: text('title').notNull(),
  description: text('description'),
  authorId: varchar('author_id', { length: 255 }).notNull().references(() => users.id, { onDelete: 'cascade' }),
  authorName: text('author_name').notNull(),
  authorAvatar: text('author_avatar'),
  game: varchar('game', { length: 50 }).notNull(),
  tags: text('tags').array().default([]),
  likes: integer('likes').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  authorIdIdx: index('gallery_images_author_id_idx').on(table.authorId),
  gameIdx: index('gallery_images_game_idx').on(table.game),
  createdAtIdx: index('gallery_images_created_at_idx').on(table.createdAt),
}));

export const db = drizzle(sql);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ReflexScore = typeof reflexScores.$inferSelect;
export type NewReflexScore = typeof reflexScores.$inferInsert;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type NewGalleryImage = typeof galleryImages.$inferInsert;