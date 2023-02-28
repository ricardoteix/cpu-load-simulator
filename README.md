# CPU Load Simulator

Este projeto tem o objetivo de simular uma carga na CPU.

A ideia nasceu da necessidade de estressar a CPU para 
das instâncias EC2 na AWS com o foco em testar o monitoramento
e analisar características como consumo de créditos de CPU.

O código foi desenvolvido em Pytho 3 utilizando principalmente
o módulo ``cpu-load-generator``. Este projeto cria uma interface
web para passar os parâmetros e facilitar a execução da
simulação de carga.

Além da interface web o projeto gera três para iniciar ou checar o
a simulação.

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


## Endpoint check:

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