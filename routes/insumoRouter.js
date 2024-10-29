const express = require("express");
const router = express.Router();


const insumoController = require("../controllers/insumoController");

router.get("/insumos", insumoController.renderizarInsumo);
router.post("/add-insumos", insumoController.adicionarInsumo);
router.post("/add-tipo-insumo", insumoController.adicionarTipoInsumo);
router.post("/add-fornecedor", insumoController.adicionarFornecedor);
router.post("/atualizar-insumo", insumoController.atualizarInsumo);
router.delete("/insumos/:id", insumoController.deletarInsumo);

module.exports = router;