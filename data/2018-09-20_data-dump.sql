-- MySQL dump 10.14  Distrib 5.5.56-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: csitsodb
-- ------------------------------------------------------
-- Server version	5.5.56-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_list`
--

DROP TABLE IF EXISTS `admin_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_list` (
  `admin_id` varchar(48) NOT NULL,
  `admin_password` varchar(256) DEFAULT NULL,
  `description` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_list`
--

LOCK TABLES `admin_list` WRITE;
/*!40000 ALTER TABLE `admin_list` DISABLE KEYS */;
INSERT INTO `admin_list` VALUES ('admin','164741359','');
/*!40000 ALTER TABLE `admin_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `app_version`
--

DROP TABLE IF EXISTS `app_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `app_version` (
  `version_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `os_type` varchar(45) DEFAULT NULL,
  `version` int(11) DEFAULT NULL,
  `registered_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `link` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`version_id`),
  UNIQUE KEY `version_id_UNIQUE` (`version_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `app_version`
--

LOCK TABLES `app_version` WRITE;
/*!40000 ALTER TABLE `app_version` DISABLE KEYS */;
INSERT INTO `app_version` VALUES (1,'tablet',1,'2018-05-18 02:15:50','https://s3.ap-northeast-2.amazonaws.com/csi-tso-srs/srs-tablet-v1.apk'),(2,'android',1,'2018-05-18 02:16:02','https://s3.ap-northeast-2.amazonaws.com/csi-tso-srs/srs-phone-v1.apk'),(3,'ios',1,'2018-05-18 02:16:36','http://sary.sofila.eduframe.co.kr:8080');
/*!40000 ALTER TABLE `app_version` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `control_log`
--

DROP TABLE IF EXISTS `control_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `control_log` (
  `index` bigint(12) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(45) DEFAULT NULL,
  `room_id` varchar(45) DEFAULT NULL,
  `controlled_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `message` text,
  PRIMARY KEY (`index`),
  UNIQUE KEY `index_UNIQUE` (`index`)
) ENGINE=InnoDB AUTO_INCREMENT=1191 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `metadata`
--

DROP TABLE IF EXISTS `metadata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `metadata` (
  `room_id` varchar(45) NOT NULL,
  `room_name` varchar(45) DEFAULT NULL,
  `floor_no` int(11) DEFAULT NULL,
  `blind_info` mediumtext,
  `gateway_static_ip` varchar(45) DEFAULT NULL,
  `gateway_serial_no` varchar(45) DEFAULT NULL,
  `gateway_id` varchar(45) DEFAULT NULL,
  `sensor_static_ip` varchar(45) DEFAULT NULL,
  `sensor_serial_no` varchar(45) DEFAULT NULL,
  `sensor_id` varchar(45) DEFAULT NULL,
  `description` text,
  `updated_time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `additional_info` mediumtext,
  PRIMARY KEY (`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metadata`
--

LOCK TABLES `metadata` WRITE;
/*!40000 ALTER TABLE `metadata` DISABLE KEYS */;
INSERT INTO `metadata` VALUES ('201','General',3,'[]','','','Sundefined','192.168.2.178','0000DD20C5A80246','S0000DD20C5A80246','Room Description','2018-07-05 09:32:38',NULL),('202','Creative',5,'[]','','','Sundefined','192.168.2.179','0000E593C5A50268','S0000E593C5A50268','Room Description','2018-07-05 09:08:47',NULL),('203','No Name',5,'[]','','','Sundefined','192.168.2.180','0000DBB8C5A60244','S0000DBB8C5A60244','Room Description','2018-07-05 09:08:39',NULL),('204','Excellence 1',6,'[]','','','Sundefined','192.168.2.181','000062B1C5AF0266','S000062B1C5AF0266','Room Description','2018-07-06 16:41:06',NULL),('205','Excellence 2',6,'[]','','','Sundefined','192.168.2.182','00006158C5720263','S00006158C5720263','Room Description','2018-07-05 09:10:42',NULL),('206','Excellence 3',6,'[]','','','Sundefined','192.168.2.183','00005B23F8850235','S00005B23F8850235','Room Description','2018-07-05 09:14:19',NULL),('207','Excellence 4',6,'[]','','','Sundefined','192.168.2.184','00006161C5760262','S00006161C5760262','Room Description','2018-07-05 09:14:41',NULL),('208','Champion 1',6,'[]','','','Sundefined','192.168.2.185','000087F9C59D0256','S000087F9C59D0256','Room Description','2018-07-06 16:15:39',NULL),('209','Champion 2',6,'[]','','','Sundefined','192.168.2.186','0000DDB4C5B10243','S0000DDB4C5B10243','Room Description','2018-07-05 09:16:19',NULL),('210','Champion 3',6,'[]','','','Sundefined','192.168.2.187','0000DDC5C5920249','S0000DDC5C5920249','Room Description','2018-07-05 09:16:43',NULL),('211','Champion 4',6,'[]','','','Sundefined','192.168.2.188','0000DD2DC5680264','S0000DD2DC5680264','Room Description','2018-07-05 09:17:08',NULL),('212','Speed',8,'[]','','','Sundefined','192.168.2.189','000083D8F8560222','S000083D8F8560222','Room Description','2018-07-05 09:17:46',NULL),('213','War Room',8,'[{\"ch_no\":1,\"blind_cnt\":3,\"blind_controller_id\":1033},{\"ch_no\":2,\"blind_cnt\":3,\"blind_controller_id\":1033},{\"ch_no\":3,\"blind_cnt\":1,\"blind_controller_id\":1033}]','192.168.8.100','45030987','S45030987','192.168.2.190','0000DFB9C5B30253','S0000DFB9C5B30253','Room Description','2018-07-06 15:56:37',NULL),('214','Equivalent 2',10,'[{\"ch_no\":1,\"blind_cnt\":2,\"blind_controller_id\":\"13\"},{\"ch_no\":2,\"blind_cnt\":2,\"blind_controller_id\":\"14\"}]','192.168.2.234','45110346','S45110346','192.168.2.191','00005B1FF8910227','S00005B1FF8910227','Room Description','2018-07-06 15:36:41',NULL),('215','Equivalent 3',10,'[{\"ch_no\":1,\"blind_cnt\":3,\"blind_controller_id\":\"19\"}]','192.168.2.227','45110344','S45110344','192.168.2.192','00005603F8700239','S00005603F8700239','Room Description','2018-07-06 16:19:18',NULL),('216','Creation 1',10,'[{\"ch_no\":1,\"blind_cnt\":3,\"blind_controller_id\":6},{\"ch_no\":2,\"blind_cnt\":2,\"blind_controller_id\":7}]','192.168.2.237','45110347','S45110347','192.168.2.193','00006368C56C0261','S00006368C56C0261','Room Description','2018-07-06 16:44:36',NULL),('217','Creation 2',10,'[{\"ch_no\":1,\"blind_cnt\":3,\"blind_controller_id\":23},{\"ch_no\":2,\"blind_cnt\":3,\"blind_controller_id\":24}]','192.168.2.227','45110356','S45110356','192.168.2.195','00006325C59F0254','S00006325C59F0254','Room Description','2018-08-11 08:21:10',NULL),('218','Solid 1',10,'[{\"ch_no\":1,\"blind_cnt\":3,\"blind_controller_id\":15},{\"ch_no\":2,\"blind_cnt\":3,\"blind_controller_id\":16},{\"ch_no\":3,\"blind_cnt\":3,\"blind_controller_id\":17},{\"ch_no\":4,\"blind_cnt\":3,\"blind_controller_id\":18}]','192.168.2.204','45110348','S45110348','192.168.2.196','00006370C59E0258','S00006370C59E0258','Room Description','2018-07-28 17:10:41',NULL),('219','Solid 2',10,'[{\"ch_no\":1,\"blind_cnt\":2,\"blind_controller_id\":\"21\"},{\"ch_no\":2,\"blind_cnt\":2,\"blind_controller_id\":\"22\"}]','192.168.2.245','45110358','S45110358','192.168.2.197','00006321C5930247','S00006321C5930247','Room Description','2018-07-06 18:18:47',NULL),('220','Solid 3',10,'[{\"ch_no\":1,\"blind_cnt\":2,\"blind_controller_id\":\"12\"},{\"ch_no\":2,\"blind_cnt\":2,\"blind_controller_id\":\"13\"}]','192.168.2.221','45110350','S45110350','192.168.2.198','00000396C5740260','S00000396C5740260','Room Description','2018-07-06 18:25:37',NULL),('221','Solid 4',10,'[{\"ch_no\":1,\"blind_cnt\":2,\"blind_controller_id\":6},{\"ch_no\":2,\"blind_cnt\":3,\"blind_controller_id\":7}]','192.168.2.221','45110338','S45110338','192.168.2.199','00006321C5930247','S00006321C5930247','Room Description','2018-07-06 19:00:34',NULL),('222','Solid 5',10,'[{\"ch_no\":1,\"blind_cnt\":2,\"blind_controller_id\":9},{\"ch_no\":2,\"blind_cnt\":2,\"blind_controller_id\":8}]','192.168.2.221','45110916','S45110916','192.168.2.200','000062CFF8580238','S000062CFF8580238','Room Description','2018-07-06 18:35:36',NULL),('223','Trustworthy 1',10,'[{\"ch_no\":1,\"blind_cnt\":2,\"blind_controller_id\":\"6\"},{\"ch_no\":2,\"blind_cnt\":3,\"blind_controller_id\":\"7\"}]','192.168.2.221','45110355','S45110355','192.168.2.201','00005267F8710234','S00005267F8710234','Room Description','2018-07-06 19:44:07',NULL),('224','Trustworthy 2',10,'[{\"ch_no\":1,\"blind_cnt\":3,\"blind_controller_id\":\"6\"},{\"ch_no\":2,\"blind_cnt\":3,\"blind_controller_id\":\"7\"},{\"ch_no\":3,\"blind_cnt\":2,\"blind_controller_id\":\"8\"},{\"ch_no\":4,\"blind_cnt\":2,\"blind_controller_id\":\"9\"}]','192.168.2.221','45110360','S45110360','192.168.2.202','0000E769C5B20252','S0000E769C5B20252','Room Description','2018-07-06 19:19:17',NULL),('225','Mission',12,'[]','','','Sundefined','192.168.2.203','00005597F8670223','S00005597F8670223','Room Description','2018-07-05 09:24:44',NULL),('226','Connection 1',15,'[]','','','Sundefined','192.168.2.204','000062EAC55E0267','S000062EAC55E0267','Room Description','2018-07-05 09:25:23',NULL),('227','Connection 2',15,'[]','','','Sundefined','192.168.2.205','00006262F8420232','S00006262F8420232','Room Description','2018-07-05 09:25:48',NULL),('228','Las Vegas',16,'[]','','','Sundefined','192.168.2.206','0000E32EC56D0242','S0000E32EC56D0242','Room Description','2018-07-05 09:26:22',NULL),('229','Integration 1',16,'[]','','','Sundefined','192.168.2.207','00008FEFF8810241','S00008FEFF8810241','Room Description','2018-07-05 09:26:46',NULL),('230','Integration 2',16,'[]','','','Sundefined','192.168.2.208','00006318C5A70245','S00006318C5A70245','Room Description','2018-07-05 09:27:19',NULL),('231','Integration 3',16,'[]','','','Sundefined','192.168.2.209','0000E51CC5950250','S0000E51CC5950250','Room Description','2018-07-05 09:27:46',NULL),('232','Passion 1',17,'[]','','','Sundefined','192.168.2.210','000062F7C5940251','S000062F7C5940251','Room Description','2018-07-05 09:28:15',NULL),('233','Passion 2',17,'[]','','','Sundefined','192.168.2.211','0000618DF8440236','S0000618DF8440236','Room Description','2018-07-05 09:28:37',NULL),('234','Passion 3',17,'[]','','','Sundefined','192.168.2.212','000020E6C59C0257','S000020E6C59C0257','Room Description','2018-07-05 09:28:59',NULL),('235','Passion 4',17,'[]','','','Sundefined','192.168.2.213','0000DE77C5A90255','S0000DE77C5A90255','Room Description','2018-07-05 09:29:24',NULL),('236','Passion 5',17,'[]','','','Sundefined','192.168.2.214','00006188F8730228','S00006188F8730228','Room Description','2018-07-05 09:29:45',NULL),('237','Pioneer',18,'[]','','','Sundefined','192.168.2.215','0000DA6AF8460233','S0000DA6AF8460233','Room Description','2018-07-05 09:30:10',NULL),('238','Coordination',19,'[]','','','Sundefined','192.168.2.216','00008A7DF8550229','S00008A7DF8550229','Room Description','2018-07-05 09:30:36',NULL),('239','Bravo',20,'[]','','','Sundefined','192.168.2.217','000090C3F88F0230','S000090C3F88F0230','Room Description','2018-07-05 09:30:58',NULL),('240','Sierra',20,'[]','','','Sundefined','192.168.2.218','000052C9F8900231','S000052C9F8900231','Room Description','2018-07-05 09:31:42',NULL),('241','Participation',22,'[]','','','Sundefined','192.168.2.219','00008259F8640240','S00008259F8640240','Room Description','2018-07-05 09:32:05',NULL),('242','Agility',23,'[]','','','Sundefined','192.168.2.220','0000E409C58A0259','S0000E409C58A0259','Room Description','2018-07-05 09:32:27',NULL),('996','Ruang14',3,'[{\"ch_no\":1,\"blind_cnt\":3,\"blind_controller_id\":17},{\"ch_no\":2,\"blind_cnt\":3,\"blind_controller_id\":18}]','192.168.2.221','45110908','S45110908','192.168.2.246','00005683886F0224','S00005683886F0224','test','2018-08-31 04:48:44',NULL);
/*!40000 ALTER TABLE `metadata` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `version`
--

DROP TABLE IF EXISTS `version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `version` (
  `id` varchar(45) NOT NULL,
  `value` int(11) DEFAULT NULL,
  `updated_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `version`
--

LOCK TABLES `version` WRITE;
/*!40000 ALTER TABLE `version` DISABLE KEYS */;
INSERT INTO `version` VALUES ('metadata_version',257,'2017-12-20 05:29:16');
/*!40000 ALTER TABLE `version` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-09-21  8:48:31
