const express = require("express");
const router = express.Router();

const colheitaController = require("../controllers/colheitaController");

router.get('/colheitas', colheitaController.renderizarColheita);
router.post('/add-colheita', colheitaController.adicionarColheita);
router.post("/atualizar-colheita", colheitaController.atualizarColheita);
router.delete("/colheitas/:id", colheitaController.deletarColheita);
router.post('/add-tipo-produto', colheitaController.adicionarTipoProduto);


module.exports = router;