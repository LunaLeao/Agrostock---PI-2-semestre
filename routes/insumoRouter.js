const express = require("express");
const router = express.Router();


const insumoController = require("../controllers/insumoController");

router.get("/insumos", insumoController.renderizarInsumo);
router.post("/add-insumos", insumoController.adicionarInsumo);
router.post("/add-tipo-insumo", insumoController.adicionarTipoInsumo);
router.post("/atualizar-insumo", insumoController.atualizarInsumo);
router.delete("/insumos/:id", insumoController.deletarInsumo);
router.get('/pesquisar', insumoController.pesquisar);
router.post('/gerar-relatorio-insumos', insumoController.gerarRelatorioInsumos);


module.exports = router;