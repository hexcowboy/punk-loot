FROM python:3.9-buster

COPY . /oracle
WORKDIR /oracle

RUN pip install -r requirements.txt
RUN brownie compile -a

CMD ["brownie", "run", "scripts/oracle.py", "--network", "rinkeby"]
