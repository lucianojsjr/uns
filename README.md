# UNS - Universal Network Sketcher

O UNS é uma ferramenta gráfica para criação de topologias de redes ópticas e execução de simulações de forma automática.
A partir da ferramenta é possível

  - Importar topologias de rede existentes.
  - Criar novas topologias de rede.
  - Configurar diferentes tipos de simuladores.
  - Execução de simulações e visualização dos resultados.

### Padrão de Integração

Para integrar o seu simulador com o UNS será necessário a construção de um webservice 
que deverá possuir os dois endpoints apresentados abaixo e seguir os padrões de resposta.

- Endpoint dos Parâmetros.
- Endpoint de Simulação.

#### Resposta de Erro

O padrão de resposta de erro para qualquer endpoint deverá seguir o padrão abaixo:

```json
{
  "status": "error",
  "message": "Não foi possível encontrar um nó."
}
```

### Resposta dos Parâmetros

O padrão de resposta do endpoint dos parâmetros deve seguir o padrão abaixo, contendo o nome do parâmetro,
e o tipo do mesmo.

```json
{
  "status": "success",
  "data":{
    "parameter_1": "int",
    "parameter_2": "double",
    "parameter_3": "string"
}
```

### Resposta da Simulação

O Padrão de resposta da simulação deve seguir o padrão abaixo, contendo o nome do atributo e o valor obtido.

```json
{
  "status": "success",
  "data": {
    "property_1": 1,
    "property_2": 2,
    "property_3": 3,
    "property_4": 4
  }
}
```

### Tecnologias

* [AngularJS] - HTML enhanced for web apps!
* [MaterializeCSS] - great UI boilerplate for modern web apps
* [Gulp] - the streaming build system
* [jQuery] - jQuery is a fast, small, and feature-rich JavaScript library

### Todos

 - Criar descrição de como rodar e contribuir com o projeto.
 - Opção de remover nós da rede.
 - Imprimir PDF da topologia.
 - Melhorar o padrão proposto.

License
----

MIT

   [MaterializeCSS]: <http://materializecss.com/>
   [jQuery]: <http://jquery.com>
   [AngularJS]: <http://angularjs.org>
   [Gulp]: <http://gulpjs.com>
