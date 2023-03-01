# CPU Load Simulator

Este projeto tem o objetivo de simular uma carga na CPU.

A ideia nasceu da necessidade de estressar a CPU para 
das instâncias EC2 na AWS com o foco em testar o monitoramento
e analisar características como consumo de créditos de CPU.

O código foi desenvolvido em Pytho 3 utilizando principalmente
o módulo ``cpu-load-generator``. Este projeto cria uma interface
web para passar os parâmetros e facilitar a execução da
simulação de carga.

Além da interface web o projeto gera três enpoints para iniciar ou 
checar a simulação.

# Uso

Para usar este código é preciso ter instalado o Python 3.7 ou 
superior com PIP.

Após instalar o Python e o PIP instale execute o comando na pasta 
do repositório.

```bash
pip install -r requirements.txt
```

Após a instalação exeucute com Python o arquivo **app.py**.

```bash
python app.py
```

Após isso basta acessar o IP da instância via navegador ou realizar as 
requisições HTTP.

## Interface Web

A interface web pode ser acessar por meio do IP da 
máquina na porta 5000. 

Há duas possibilidades de carga pela interface web:

- Simples: gera uma carga contínua, com percentual fixo 
durante o tempo especificado.
- Múltipla: gera várias cargas em sequência de acordo com a 
especificação no gráfico apresentado na interface. 

É possível ver uma imagem da interface no final desta
página mostra como. Para mover os pontos de controle posicione o 
cursor no percentual e tempo desejado acima ou abaixo
de cada ponto e clique na tela.

## Endpoint cpu-load:

Com este endpoint é possível estressar um core da CPU com 
uma GET como a seguir.

``curl "http://localhost:5000/api/cpu-load/perc/PERC/duration/DURACAO"`` 

Você pode modificar os valores:

- PERC: é o objetivo do percentual de CPU que se deseja atingir.
- DURACAO: define por quanto tempo ficará no percentual especificado.

Há também a possibilidade de estressar apenas um core.

``curl "http://localhost:5000/api/cpu-load/cores/CORE/perc/PERC/duration/DURACAO"`` 

- O parâmetro CORE recebe um inteiro, que inicia por zero, 
que informa qual core se deseja elevar a CPU.

O retorno destes endpoints contém um objeto como no exemplo a seguir:

```json
{
    "success": 200, 
    "body": {
        "cores": -1, 
        "numCores": 8, 
        "perc": 10, 
        "duration": 10, 
        "running": true, 
        "elapsedTime": 0
    }
}
```


## Endpoint cpu-load check:

Enquanto o processo de estressar a CPU estiver ativo, é possível
realizar uma requisição no neste endpoint para saber o status.

``http://localhost:5000/api/cpu-load/check``

O resultado também será como o objeto a seguir:


```json
{
    "success": 200, 
    "body": {
        "cores": -1, 
        "numCores": 8, 
        "perc": 10, 
        "duration": 10, 
        "running": true, 
        "elapsedTime": 6
    }
}
```

Onde,

- cores: informa qual core foi selecionado para estressar, se aplicável. 
O valor padrão -1 indica que todos os cores serão estressados.
- numCores: é a quantidade de cores do hardware.
- perc: o percentual máximo desejado para estressar.
- duration: qual o tempo total do processo.
- running: um booleano que indica se o processo ainda está sendo execurado.
- elapsedTime: quanto tempo se passou desde o início do processo.

# Considerações sobre o projeto

- A carga na cpu é realizada pelo módulo Python 
``cpu-load-generator``.
- O módulo não é preciso, portanto, o valor da CPU pode não ficar
fixo no percentual desejado durante o tempo de execução, mas
num valor aproximado.
- O tempo também pode divergir. Nos testes realizados o tempo 
de execução da carga foi um pouco maior do que o solicitado,
principalmente na carga múltipla.

# Imagem da Interface
![Tela do software](https://github.com/ricardoteix/cpu-load-simulator/raw/main/assets/web_interface.jpg)
