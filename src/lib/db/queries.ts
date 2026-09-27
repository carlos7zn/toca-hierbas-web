import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { eq, desc, and, gte } from 'drizzle-orm';
import { users, reflexScores, galleryImages, type User, type NewUser, type ReflexScore, type NewReflexScore, type GalleryImage, type NewGalleryImage } from './schema';

export const db = drizzle(sql);

export async function getUserByDiscordId(discordId: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.discordId, discordId)).limit(1);
  return result[0] || null;
}

export async function createUser(user: NewUser): Promise<User> {
  const result = await db.insert(users).values(user).returning();
  return result[0];
}

export async function upsertUser(user: NewUser): Promise<User> {
  const existing = await getUserByDiscordId(user.discordId);
  if (existing) {
    const result = await db.update(users).set({
      name: user.name,
      email: user.email,
      image: user.image,
      updatedAt: new Date(),
    }).where(eq(users.discordId, user.discordId)).returning();
    return result[0];
  }
  return createUser(user);
}

export async function saveReflexScore(score: NewReflexScore): Promise<ReflexScore> {
  const result = await db.insert(reflexScores).values(score).returning();
  return result[0];
}

export async function getTopReflexScores(limit = 10): Promise<ReflexScore[]> {
  return db.select().from(reflexScores).orderBy(reflexScores.reactionTime).limit(limit);
}

export async function getUserReflexScores(userId: string, limit = 10): Promise<ReflexScore[]> {
  return db.select().from(reflexScores)
    .where(eq(reflexScores.userId, userId))
    .orderBy(reflexScores.reactionTime)
    .limit(limit);
}

export async function getUserBestReflexScore(userId: string): Promise<ReflexScore | null> {
  const result = await db.select().from(reflexScores)
    .where(eq(reflexScores.userId, userId))
    .orderBy(reflexScores.reactionTime)
    .limit(1);
  return result[0] || null;
}

export async function saveGalleryImage(image: NewGalleryImage): Promise<GalleryImage> {
  const result = await db.insert(galleryImages).values(image).returning();
  return result[0];
}

export async function getGalleryImages(options?: { game?: string; limit?: number; offset?: number }): Promise<GalleryImage[]> {
  const { game, limit = 20, offset = 0 } = options || {};
  let query = db.select().from(galleryImages).orderBy(desc(galleryImages.createdAt)).limit(limit).offset(offset);
  
  if (game) {
    query = db.select().from(galleryImages)
      .where(eq(galleryImages.game, game))
      .orderBy(desc(galleryImages.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  return query;
}

export async function getGalleryImageById(id: string): Promise<GalleryImage | null> {
  const result = await db.select().from(galleryImages).where(eq(galleryImages.id, id)).limit(1);
  return result[0] || null;
}

export async function likeGalleryImage(id: string): Promise<GalleryImage | null> {
  const result = await db.update(galleryImages)
    .set({ likes: sql`${galleryImages.likes} + 1` })
    .where(eq(galleryImages.id, id))
    .returning();
  return result[0] || null;
}

export async function deleteGalleryImage(id: string, authorId: string): Promise<boolean> {
  const result = await db.delete(galleryImages)
    .where(and(eq(galleryImages.id, id), eq(galleryImages.authorId, authorId)))
    .returning({ id: galleryImages.id });
  return result.length > 0;
}