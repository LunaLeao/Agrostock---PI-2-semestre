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
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('pt-BR', options);
};

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

app.use("/", rotaUsuario);

const rotaColheita = require("./routes/colheitaRouter");
app.use("/", rotaColheita);

const rotaVenda = require("./routes/vendaRouter");
app.use("/", rotaVenda);

const insumoRouter = require('./routes/insumoRouter');
app.use('/', insumoRouter);

const rotaFornecedor = require("./routes/fornecedorRouter")
app.use('/', rotaFornecedor);

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

