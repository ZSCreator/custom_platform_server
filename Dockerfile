FROM 192.168.88.129:5000/game_back_end/pinus:v1
LABEL Name=game_back_end Version=0.0.1
WORKDIR /usr/app/game_back-end
COPY ["package.json","package-lock.json","./"]
COPY ["node_modules","./node_modules/"]
COPY ["dist","./dist/"]
#RUN npm i 
EXPOSE 3010
EXPOSE 3200
EXPOSE 3201
WORKDIR /usr/app/game_back-end/dist
CMD cd /usr/app/game_back-end/dist && pinus start
#CMD /usr/games/fortune -a | cowsay
