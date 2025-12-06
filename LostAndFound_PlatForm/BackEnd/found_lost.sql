-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 06, 2025 at 03:43 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `found_lost`
--

-- --------------------------------------------------------

--
-- Table structure for table `claims`
--

CREATE TABLE `claims` (
  `id` int(11) NOT NULL,
  `item_id` int(11) DEFAULT NULL,
  `claimant_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `item_type` enum('lost','found') NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `date_lost_found` date DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `status` enum('open','resolved','closed') DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `contact_phone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `title`, `description`, `item_type`, `category`, `location`, `date_lost_found`, `image`, `user_id`, `status`, `created_at`, `contact_phone`) VALUES
(2, 'Wallet Found', 'Brown leather wallet with cards', 'found', 'Personal Items', 'Nasr City', '2024-01-10', NULL, 2, 'open', '2025-11-20 15:26:03', NULL),
(3, 'iPhone Found', 'orange iphone 17', 'found', 'Personal Items', 'Tanta City', '2024-01-10', NULL, 3, 'open', '2025-11-20 16:22:13', '01004573934'),
(5, 'محفظة ', 'لو بتعتك رن عليااا و قول اي الي فيهااا  و خدهاا ', 'found', 'Wallet', 'جامعة طنطا , كلية هندسة مبني 4 الدور 3', '2025-11-19', NULL, 1, 'open', '2025-11-20 17:06:22', '01283980388'),
(9, 'فلوس', 'انا ضاع مني 400 جنيه لو حد لاقاهم بتواصل معايا ', 'lost', 'Other', 'جامعة طنطا , كلية هندسة مبني 4 الدور 3', '2025-11-20', NULL, 6, 'open', '2025-11-21 11:16:53', '01016513868'),
(11, 'keys', '', 'found', 'Keys', 'جامعة طنطا , كلية هندسة مبني 4 الدور 3', '2025-12-01', NULL, 7, 'open', '2025-12-03 21:01:42', '01032050554');

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_resets`
--

INSERT INTO `password_resets` (`id`, `email`, `token`, `expires_at`, `created_at`) VALUES
(13, 'ahmedzyan58@gmail.com', '528066', '2025-11-21 14:13:16', '2025-11-21 11:13:16');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `created_at`) VALUES
(1, 'Ahmed Mohamed', 'ahmed@example.com', '123456', '01012345678', '2025-11-20 15:26:03'),
(2, 'Sara Ali', 'sara@example.com', '123456', '01123456789', '2025-11-20 15:26:03'),
(3, 'Ahmed Zyan', 'AhmedZyan@example.com', '123456', '01004573934', '2025-11-20 16:22:13'),
(4, 'abdulrahman Zahana', 'elgobedo@gmail.com', '$2y$10$c180yDieGXzoZ9vYS4sVQOntNvf/MBzU3HiVobB5NGPJVZ9D15NBm', '01283980388', '2025-11-20 21:20:46'),
(5, 'abdo', 'abdulrahmanmamdouhzahana@gmail.com', '$2y$10$Bg7HYs2dSDrs6.yfK7hu0eEIBPQJI4DNfuyKb056sVR/CoPgKg/Sq', '01004573934', '2025-11-21 01:27:26'),
(6, 'Ahmed Zyan', 'ahmedzyan58@gmail.com', '$2y$10$XZkMuL6cYEslfmzzfXA9JuUE1JYZVHUWv6KjKfZa6j7eZfKRQ4Th.', '01016513868', '2025-11-21 11:12:32'),
(7, 'mohamed', 'mohamed@gmail.com', '$2y$10$sJPib43RdLX8SZTWzmDRcOk01yPEUFVmc.XBCq88jO/AxTY5TNT72', '01032050554', '2025-12-03 20:57:04');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `claims`
--
ALTER TABLE `claims`
  ADD PRIMARY KEY (`id`),
  ADD KEY `item_id` (`item_id`),
  ADD KEY `claimant_id` (`claimant_id`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `claims`
--
ALTER TABLE `claims`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `claims`
--
ALTER TABLE `claims`
  ADD CONSTRAINT `claims_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  ADD CONSTRAINT `claims_ibfk_2` FOREIGN KEY (`claimant_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
