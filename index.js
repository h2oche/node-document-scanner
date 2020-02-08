const cv = require('opencv4nodejs');
cv.imreadAsync('./ticket.jpg')
  .then(async img => {
    const cvPoint = (x, y) => new cv.Point2(x, y);

    const size = img.sizes;
    console.log(size);
    const ratio = 2;
    img = img.resize(Math.floor(img.sizes[0] / ratio), Math.floor(img.sizes[1] / ratio));
    cv.imwrite('./img-resized.png', img);
    const grayImg = await img.bgrToGrayAsync();
    cv.imwrite('./img-gray.png', grayImg);
    const blurredImg = cv.gaussianBlur(grayImg, new cv.Size(5, 5), 0);
    cv.imwrite('./img-blurred.png', blurredImg);

    /* add dilate */
    const dilateKernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(9, 9));
    const dilated = blurredImg.dilate(dilateKernel);
    cv.imwrite('./img-dilated.png', dilated);

    const edgedImg = dilated.canny(0, 83);
    cv.imwrite('./img-canny.png', edgedImg);
    
    /* Heuristic 1(First try) */
    let contours = edgedImg.findContours(cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
    console.log(contours);

    contours = contours.sort((_con1, _con2) => _con2.area - _con1.area);
    console.log(contours.slice(0, 5));

    const contImg = img.copy();
    contImg.drawContours(contours.slice(0, 1).map(contour => contour.getPoints()), -1, new cv.Vec3(255, 255, 0), {thickness: 3});
    cv.imwrite('./img-cont.png', contImg);

    let target = null;

    for(let i = 0 ; i < contours.length ; i += 1) {
      let p = contours[i].arcLength(true);
      let approx = contours[i].approxPolyDP(0.02 * p, true)
      console.log(`${i} : ${p} : ${approx.length}`);
      if(approx.length == 4) {
        console.log(contours[i]);
        target = approx;
        break;
      }
    }

    if(target) {
      target.sort((point1, point2) => (point1.x + point1.y) - (point2.x + point2.y));
      const swap = (target, i, j) => [target[i], target[j]] = [target[j], target[i]];
      if(target[1].x < target[2].x)
        swap(target, 1, 2);
      swap(target, 2, 3);
      console.log(target);

      console.log(img.sizes);
      
      const docWidth = 500;
      const docHeight = (img.sizes[0] / img.sizes[1]) * docWidth;
      console.log(docHeight);
      let pts = [[0,0], [docWidth, 0], [docWidth, docHeight], [0, docHeight]];
      pts = pts.map(point => cvPoint(point[0], point[1]));
      const op = cv.getPerspectiveTransform(target, pts);
      const docImg = img.warpPerspective(op, new cv.Size(docWidth, docHeight));
      cv.imwrite('./img-document.png', docImg);
    }
  });