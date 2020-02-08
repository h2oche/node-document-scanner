# install

1. install docker
2. ./build.sh 3.4.1 y 10 
3. docker run --name hello-opencv -idt -v $PWD:/opt/document-scanner opencv-nodejs:node10-opencv3.4.1-contrib
4. docker exec -it hello-opencv /bin/bash
5. node index.js

# demo

- original image

![org](./ticket.jpg)

- document image

![doc](./img-document.png)