import { MigrationInterface, QueryRunner } from 'typeorm';

// Initial schema for the modular monolith (docs/architecture-plan.md §F). Written as raw SQL
// (rather than TypeORM's QueryBuilder migration API) for a schema of this size, and hand
// verified against the entities in src/modules/**/entities — there is no live Postgres
// instance in this environment to auto-generate/diff against.
export class InitSchema1755300000000 implements MigrationInterface {
  name = 'InitSchema1755300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    // Backs the fuzzy food-name search (GET /foods/search) without a dedicated search engine.
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);

    // ---------------------------------------------------------------- identity
    await queryRunner.query(`
      CREATE TYPE "users_auth_provider_enum" AS ENUM ('local', 'google', 'apple');
      CREATE TYPE "users_gender_enum" AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar(255) NOT NULL,
        "password_hash" varchar(255),
        "full_name" varchar(255) NOT NULL,
        "date_of_birth" date,
        "gender" "users_gender_enum",
        "auth_provider" "users_auth_provider_enum" NOT NULL DEFAULT 'local',
        "oauth_subject" varchar(255),
        "email_verified_at" timestamptz,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX "idx_users_email" ON "users" ("email");
    `);

    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "token_hash" varchar(255) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "revoked_at" timestamptz,
        "replaced_by_token_id" uuid,
        "created_by_ip" varchar(64),
        "user_agent" varchar(255),
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens" ("user_id");
      CREATE UNIQUE INDEX "idx_refresh_tokens_token_hash" ON "refresh_tokens" ("token_hash");
    `);

    // ---------------------------------------------------------------- profile
    await queryRunner.query(`
      CREATE TYPE "user_profiles_activity_level_enum" AS ENUM
        ('sedentary', 'light', 'moderate', 'active', 'very_active');

      CREATE TABLE "user_profiles" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "height_cm" numeric(5,2) NOT NULL,
        "current_weight_kg" numeric(5,2) NOT NULL,
        "activity_level" "user_profiles_activity_level_enum" NOT NULL DEFAULT 'moderate',
        "dietary_preferences" jsonb,
        "allergies" jsonb,
        "timezone" varchar(64) NOT NULL DEFAULT 'Asia/Kolkata',
        "onboarding_completed_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX "idx_user_profiles_user_id" ON "user_profiles" ("user_id");
    `);

    await queryRunner.query(`
      CREATE TYPE "user_goals_goal_type_enum" AS ENUM (
        'weight_loss', 'fat_loss', 'weight_maintenance', 'muscle_gain',
        'strength_improvement', 'general_fitness', 'endurance', 'body_recomposition'
      );
      CREATE TYPE "user_goals_source_enum" AS ENUM ('system_calculated', 'user_override');

      CREATE TABLE "user_goals" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "goal_type" "user_goals_goal_type_enum" NOT NULL,
        "target_weight_kg" numeric(5,2),
        "weekly_weight_change_goal_kg" numeric(4,2),
        "calorie_target" int NOT NULL,
        "protein_target_g" numeric(6,2) NOT NULL,
        "carb_target_g" numeric(6,2) NOT NULL,
        "fat_target_g" numeric(6,2) NOT NULL,
        "fiber_target_g" numeric(6,2) NOT NULL,
        "water_target_ml" int NOT NULL,
        "source" "user_goals_source_enum" NOT NULL DEFAULT 'system_calculated',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX "idx_user_goals_user_id_is_active" ON "user_goals" ("user_id", "is_active");
      -- Append-only history, but only one row may be "current" per user at a time.
      CREATE UNIQUE INDEX "idx_user_goals_one_active_per_user"
        ON "user_goals" ("user_id") WHERE "is_active" = true;
    `);

    // ---------------------------------------------------------------- nutrition
    await queryRunner.query(`
      CREATE TYPE "source_type_enum" AS ENUM
        ('USDA', 'IFCT', 'OPENFOODFACTS', 'ADMIN', 'USER', 'AI_ESTIMATE');

      CREATE TABLE "food_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "brand" varchar(255),
        "barcode" varchar(64),
        "category" varchar(128),
        "serving_size_g" numeric(8,2),
        "serving_unit" varchar(32),
        "source_type" "source_type_enum" NOT NULL,
        "external_id" varchar(128),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX "idx_food_items_barcode" ON "food_items" ("barcode") WHERE "barcode" IS NOT NULL;
      -- GIN trigram index powering fuzzy GET /foods/search (architecture plan §D, §F).
      CREATE INDEX "idx_food_items_name_trgm" ON "food_items" USING gin ("name" gin_trgm_ops);
    `);

    await queryRunner.query(`
      CREATE TABLE "food_nutrition" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "food_item_id" uuid NOT NULL REFERENCES "food_items"("id") ON DELETE CASCADE,
        "calories_per_100g" numeric(8,2) NOT NULL,
        "protein_g" numeric(8,2) NOT NULL,
        "carbs_g" numeric(8,2) NOT NULL,
        "fat_g" numeric(8,2) NOT NULL,
        "fiber_g" numeric(8,2) NOT NULL DEFAULT 0,
        "sugar_g" numeric(8,2),
        "sodium_mg" numeric(8,2),
        "source_type" "source_type_enum" NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX "idx_food_nutrition_food_item_id" ON "food_nutrition" ("food_item_id");
    `);

    await queryRunner.query(`
      CREATE TYPE "meals_meal_type_enum" AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');
      CREATE TYPE "meals_input_method_enum" AS ENUM ('manual', 'ai_photo', 'barcode');

      CREATE TABLE "meals" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "meal_type" "meals_meal_type_enum" NOT NULL,
        "input_method" "meals_input_method_enum" NOT NULL DEFAULT 'manual',
        "logged_at" timestamptz NOT NULL,
        "notes" text,
        "total_calories" numeric(8,2) NOT NULL DEFAULT 0,
        "total_protein_g" numeric(8,2) NOT NULL DEFAULT 0,
        "total_carbs_g" numeric(8,2) NOT NULL DEFAULT 0,
        "total_fat_g" numeric(8,2) NOT NULL DEFAULT 0,
        "total_fiber_g" numeric(8,2) NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX "idx_meals_user_id_logged_at" ON "meals" ("user_id", "logged_at");
    `);

    await queryRunner.query(`
      CREATE TABLE "meal_items" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "meal_id" uuid NOT NULL REFERENCES "meals"("id") ON DELETE CASCADE,
        "food_item_id" uuid REFERENCES "food_items"("id"),
        "food_name" varchar(255) NOT NULL,
        "quantity" numeric(8,2) NOT NULL,
        "unit" varchar(32) NOT NULL,
        "weight_g" numeric(8,2),
        "calories" numeric(8,2) NOT NULL,
        "protein_g" numeric(8,2) NOT NULL,
        "carbs_g" numeric(8,2) NOT NULL,
        "fat_g" numeric(8,2) NOT NULL,
        "fiber_g" numeric(8,2) NOT NULL DEFAULT 0,
        "source_type" "source_type_enum" NOT NULL,
        "confidence" numeric(4,3),
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX "idx_meal_items_meal_id" ON "meal_items" ("meal_id");
    `);

    await queryRunner.query(`
      CREATE TABLE "meal_images" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "meal_id" uuid NOT NULL REFERENCES "meals"("id") ON DELETE CASCADE,
        "s3_key" varchar(512) NOT NULL,
        "original_filename" varchar(255),
        "content_type" varchar(128),
        "size_bytes" int,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX "idx_meal_images_meal_id" ON "meal_images" ("meal_id");
    `);

    await queryRunner.query(`
      CREATE TYPE "nutrition_logs_source_enum" AS ENUM ('meal', 'water');

      CREATE TABLE "nutrition_logs" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "logged_at" timestamptz NOT NULL,
        "source" "nutrition_logs_source_enum" NOT NULL,
        "meal_id" uuid REFERENCES "meals"("id") ON DELETE SET NULL,
        "meal_item_id" uuid,
        "calories" numeric(8,2) NOT NULL DEFAULT 0,
        "protein_g" numeric(8,2) NOT NULL DEFAULT 0,
        "carbs_g" numeric(8,2) NOT NULL DEFAULT 0,
        "fat_g" numeric(8,2) NOT NULL DEFAULT 0,
        "fiber_g" numeric(8,2) NOT NULL DEFAULT 0,
        "water_ml" int NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX "idx_nutrition_logs_user_id_logged_at" ON "nutrition_logs" ("user_id", "logged_at");
    `);

    await queryRunner.query(`
      -- Composite PK (user_id, summary_date) — upserted synchronously with the meal write
      -- (see nutrition.service.ts). Dashboards read only from this table, never raw
      -- nutrition_logs (architecture plan §F).
      CREATE TABLE "daily_nutrition_summary" (
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "summary_date" date NOT NULL,
        "total_calories" numeric(8,2) NOT NULL DEFAULT 0,
        "total_protein_g" numeric(8,2) NOT NULL DEFAULT 0,
        "total_carbs_g" numeric(8,2) NOT NULL DEFAULT 0,
        "total_fat_g" numeric(8,2) NOT NULL DEFAULT 0,
        "total_fiber_g" numeric(8,2) NOT NULL DEFAULT 0,
        "total_water_ml" int NOT NULL DEFAULT 0,
        "target_calories" int NOT NULL DEFAULT 0,
        "target_protein_g" numeric(6,2) NOT NULL DEFAULT 0,
        "meal_count" int NOT NULL DEFAULT 0,
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY ("user_id", "summary_date")
      );
    `);

    // ---------------------------------------------------------------- workout
    await queryRunner.query(`
      CREATE TABLE "exercises" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "category" varchar(64) NOT NULL,
        "muscle_group" varchar(64),
        "equipment" varchar(64),
        "is_custom" boolean NOT NULL DEFAULT false,
        "created_by_user_id" uuid,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX "idx_exercises_name" ON "exercises" ("name");
    `);

    await queryRunner.query(`
      CREATE TYPE "workout_sessions_source_enum" AS ENUM ('manual', 'text_parse', 'voice_parse');

      CREATE TABLE "workout_sessions" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "started_at" timestamptz NOT NULL,
        "ended_at" timestamptz,
        "notes" text,
        "source" "workout_sessions_source_enum" NOT NULL DEFAULT 'manual',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX "idx_workout_sessions_user_id_started_at" ON "workout_sessions" ("user_id", "started_at");
    `);

    await queryRunner.query(`
      CREATE TABLE "workout_exercises" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "workout_session_id" uuid NOT NULL REFERENCES "workout_sessions"("id") ON DELETE CASCADE,
        "exercise_id" uuid NOT NULL REFERENCES "exercises"("id"),
        "order_index" int NOT NULL DEFAULT 0,
        "notes" text,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX "idx_workout_exercises_session_id" ON "workout_exercises" ("workout_session_id");
    `);

    await queryRunner.query(`
      -- user_id/exercise_id/performed_at denormalized directly onto this table (highest
      -- cardinality in the schema) so progression/PR queries avoid a 3-table join at scale.
      CREATE TABLE "workout_sets" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "workout_exercise_id" uuid NOT NULL REFERENCES "workout_exercises"("id") ON DELETE CASCADE,
        "user_id" uuid NOT NULL,
        "exercise_id" uuid NOT NULL,
        "performed_at" timestamptz NOT NULL,
        "set_number" int NOT NULL,
        "weight_kg" numeric(6,2),
        "reps" int,
        "duration_seconds" int,
        "rest_seconds" int,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX "idx_workout_exercise_id" ON "workout_sets" ("workout_exercise_id");
      CREATE INDEX "idx_workout_sets_user_exercise_performed_at"
        ON "workout_sets" ("user_id", "exercise_id", "performed_at" DESC);
    `);

    await queryRunner.query(`
      CREATE TYPE "personal_records_record_type_enum" AS ENUM
        ('max_weight', 'max_reps', 'max_volume', 'max_duration');

      CREATE TABLE "personal_records" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "exercise_id" uuid NOT NULL REFERENCES "exercises"("id"),
        "record_type" "personal_records_record_type_enum" NOT NULL,
        "value" numeric(10,2) NOT NULL,
        "achieved_at" timestamptz NOT NULL,
        "workout_set_id" uuid,
        "is_current" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX "idx_personal_records_user_exercise_type"
        ON "personal_records" ("user_id", "exercise_id", "record_type");
      -- Append-only, but only one "current" PR per (user, exercise, record_type).
      CREATE UNIQUE INDEX "idx_personal_records_one_current"
        ON "personal_records" ("user_id", "exercise_id", "record_type") WHERE "is_current" = true;
    `);

    // ---------------------------------------------------------------- ai gateway
    await queryRunner.query(`
      CREATE TYPE "ai_requests_request_type_enum" AS ENUM ('analyze_meal_image', 'parse_workout_text');
      CREATE TYPE "ai_requests_status_enum" AS ENUM ('pending', 'success', 'failed');

      CREATE TABLE "ai_requests" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
        "request_type" "ai_requests_request_type_enum" NOT NULL,
        "provider" varchar(64),
        "model" varchar(128),
        "input_ref" varchar(512),
        "status" "ai_requests_status_enum" NOT NULL DEFAULT 'pending',
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX "idx_ai_requests_user_id_created_at" ON "ai_requests" ("user_id", "created_at");
    `);

    await queryRunner.query(`
      CREATE TYPE "ai_responses_validation_status_enum" AS ENUM ('valid', 'invalid', 'not_validated');

      CREATE TABLE "ai_responses" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "ai_request_id" uuid NOT NULL REFERENCES "ai_requests"("id") ON DELETE CASCADE,
        "tokens_input" int,
        "tokens_output" int,
        "cost_usd" numeric(10,6),
        "latency_ms" int,
        "validation_status" "ai_responses_validation_status_enum" NOT NULL DEFAULT 'not_validated',
        "raw_response_ref" varchar(512),
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
      CREATE UNIQUE INDEX "idx_ai_responses_ai_request_id" ON "ai_responses" ("ai_request_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_responses"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ai_requests"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "personal_records"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "workout_sets"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "workout_exercises"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "workout_sessions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "exercises"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "daily_nutrition_summary"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "nutrition_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "meal_images"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "meal_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "meals"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "food_nutrition"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "food_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_goals"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_profiles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "ai_responses_validation_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "ai_requests_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "ai_requests_request_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "personal_records_record_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "workout_sessions_source_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "nutrition_logs_source_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "meals_input_method_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "meals_meal_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "source_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_goals_source_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_goals_goal_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_profiles_activity_level_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "users_gender_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "users_auth_provider_enum"`);
  }
}
