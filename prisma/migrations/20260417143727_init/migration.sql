-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stades` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(100) NULL,
    `prix` VARCHAR(10) NULL,
    `localisation` VARCHAR(100) NULL,
    `duree` VARCHAR(20) NULL,
    `img` VARCHAR(255) NULL,
    `booking_service_id` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reservations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pitch_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,
    `booking_type` VARCHAR(20) NOT NULL,
    `start_date` DATE NOT NULL,
    `start_time` TIME NOT NULL,
    `total_days` INTEGER NULL DEFAULT 1,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(20) NULL DEFAULT 'pending',
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `reservations_pitch_id_idx`(`pitch_id`),
    INDEX `reservations_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gc_tournaments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `organizer_id` INTEGER NOT NULL,
    `pitch_id` INTEGER NOT NULL,
    `tournament_name` VARCHAR(100) NOT NULL,
    `team_count` INTEGER NOT NULL,
    `booking_date` DATE NOT NULL,
    `booking_time` TIME NOT NULL,
    `total_price` FLOAT NOT NULL,
    `status` VARCHAR(20) NULL DEFAULT 'setup',
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `gc_tournaments_pitch_id_idx`(`pitch_id`),
    INDEX `gc_tournaments_organizer_id_idx`(`organizer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gc_tournament_teams` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournament_id` INTEGER NOT NULL,
    `team_name` VARCHAR(100) NOT NULL,

    INDEX `gc_tournament_teams_tournament_id_idx`(`tournament_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gc_tournament_matches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournament_id` INTEGER NOT NULL,
    `round` INTEGER NOT NULL,
    `match_order` INTEGER NOT NULL,
    `team1_id` INTEGER NULL,
    `team2_id` INTEGER NULL,
    `team1_score` INTEGER NULL,
    `team2_score` INTEGER NULL,
    `team1_penalties` INTEGER NULL,
    `team2_penalties` INTEGER NULL,
    `winner_id` INTEGER NULL,
    `next_match_id` INTEGER NULL,

    INDEX `gc_tournament_matches_tournament_id_idx`(`tournament_id`),
    INDEX `gc_tournament_matches_team1_id_idx`(`team1_id`),
    INDEX `gc_tournament_matches_team2_id_idx`(`team2_id`),
    INDEX `gc_tournament_matches_next_match_id_idx`(`next_match_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_pitch_id_fkey` FOREIGN KEY (`pitch_id`) REFERENCES `stades`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reservations` ADD CONSTRAINT `reservations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gc_tournaments` ADD CONSTRAINT `gc_tournaments_pitch_id_fkey` FOREIGN KEY (`pitch_id`) REFERENCES `stades`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gc_tournaments` ADD CONSTRAINT `gc_tournaments_organizer_id_fkey` FOREIGN KEY (`organizer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gc_tournament_teams` ADD CONSTRAINT `gc_tournament_teams_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `gc_tournaments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gc_tournament_matches` ADD CONSTRAINT `gc_tournament_matches_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `gc_tournaments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gc_tournament_matches` ADD CONSTRAINT `gc_tournament_matches_team1_id_fkey` FOREIGN KEY (`team1_id`) REFERENCES `gc_tournament_teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gc_tournament_matches` ADD CONSTRAINT `gc_tournament_matches_team2_id_fkey` FOREIGN KEY (`team2_id`) REFERENCES `gc_tournament_teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gc_tournament_matches` ADD CONSTRAINT `gc_tournament_matches_winner_id_fkey` FOREIGN KEY (`winner_id`) REFERENCES `gc_tournament_teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gc_tournament_matches` ADD CONSTRAINT `gc_tournament_matches_next_match_id_fkey` FOREIGN KEY (`next_match_id`) REFERENCES `gc_tournament_matches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
