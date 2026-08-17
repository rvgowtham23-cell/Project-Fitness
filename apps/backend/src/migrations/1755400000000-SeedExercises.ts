import { MigrationInterface, QueryRunner } from 'typeorm';

// Seeds the starter exercise library from the product spec (§10) so a fresh database isn't
// unusable for manual/text workout logging out of the box — this was previously only present
// as an ad-hoc INSERT run by hand against one dev database, which a fresh `migration:run`
// would not have reproduced.
export class SeedExercises1755400000000 implements MigrationInterface {
  name = 'SeedExercises1755400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "exercises" ("name", "category", "muscle_group", "equipment") VALUES
        ('Squat', 'strength', 'legs', 'barbell'),
        ('Bench Press', 'strength', 'chest', 'barbell'),
        ('Deadlift', 'strength', 'back', 'barbell'),
        ('Lat Pulldown', 'strength', 'back', 'cable'),
        ('Barbell Row', 'strength', 'back', 'barbell'),
        ('Shoulder Press', 'strength', 'shoulders', 'dumbbell'),
        ('Bicep Curl', 'strength', 'arms', 'dumbbell'),
        ('Tricep Extension', 'strength', 'arms', 'cable'),
        ('Leg Press', 'strength', 'legs', 'machine'),
        ('Lunges', 'strength', 'legs', 'none'),
        ('Pushups', 'strength', 'chest', 'none'),
        ('Pullups', 'strength', 'back', 'none'),
        ('Plank', 'core', 'core', 'none')
      ON CONFLICT (name) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "exercises" WHERE "name" IN (
        'Squat', 'Bench Press', 'Deadlift', 'Lat Pulldown', 'Barbell Row',
        'Shoulder Press', 'Bicep Curl', 'Tricep Extension', 'Leg Press',
        'Lunges', 'Pushups', 'Pullups', 'Plank'
      );
    `);
  }
}
