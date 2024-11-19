const express = require("express");
const router = express.Router();
 
const dashboardController = require("../controllers/dashboardController");
 
router.get('/dashboard', dashboardController.renderizarDashboard);
router.get('/dashboard', dashboardController.carregarGraficoColheita);
 
module.exports = router;