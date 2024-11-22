const express = require("express");
const app = express();
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const path = require('path');
const session = require('express-session');
const Handlebars = require("handlebars");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const formatDate = (date) => {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(date).toLocaleDateString('pt-BR', options);
};

Handlebars.registerHelper('formatDate', function(date) {
  // Verifica se a data é válida e não está vazia
  if (!date || isNaN(new Date(date))) {
    return '00-00-0000'; // Retorna o valor padrão
  }

  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0'); // Garante que o dia tenha 2 dígitos
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Garante que o mês tenha 2 dígitos
  const year = d.getFullYear(); // Obtém o ano completo

  return `${day}/${month}/${year}`; // Retorna a data no formato "dd/mm/yyyy"
});

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'chave123@',
  resave: false,
  saveUninitialized: false
}));

app.set('views', path.join(__dirname, 'views'));

app.engine('handlebars', engine ({
  defaultLayout: 'main',
  helpers: {
    formatDate: formatDate
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true, // Adicione esta linha
    allowProtoMethodsByDefault: true, // E esta linha, se necessário
  }
}));
app.set('view engine', 'handlebars');
//app.engine('handlebars', exphbs());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const rotaUsuario = require("./routes/usuarioRouter");
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use("/", rotaUsuario);

const rotaColheita = require("./routes/colheitaRouter");
app.use("/", rotaColheita);

const rotaVenda = require("./routes/vendaRouter");
app.use("/", rotaVenda);

const insumoRouter = require('./routes/insumoRouter');
app.use('/', insumoRouter);

const rotaFornecedor = require("./routes/fornecedorRouter")
app.use('/', rotaFornecedor);

const rotaDashboard = require("./routes/dashboardRouter");
app.use("/", rotaDashboard);

// Página inicial
app.get("/", function (req, res) {
  res.render("login_pag", {
    backgroundImage: '/img/Ramos.png',
    logoImage: '/img/IMG-20240907-WA0006-removebg-preview.png'
  });
});

Handlebars.registerHelper('formatCurrency', function(value) {
  if (value) {
      return 'R$ ' + parseFloat(value).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }
  return 'R$ 0,00'; // Caso o valor seja vazio ou nulo
});

// Inicialização do servidor
const porta = 8082;
app.listen(porta, function () {
  console.log("Servidor rodando na porta "+ porta);
});

