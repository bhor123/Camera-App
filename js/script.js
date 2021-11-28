let video = document.querySelector("video");
let vidBtn = document.querySelector("button#record");
let capBtn = document.querySelector("button#capture")
let constraints = { video: true, audio: true };
let mediaRecorder;
let galleryBtn=document.querySelector(".gallery-btn");

let isRecording = false;
let chunks = [];

const minZoom=1;
const maxZoom=3;
let currZoom=1; 
let zoomIn=document.querySelector(".zoom-in");
let zoomOut=document.querySelector(".zoom-out");

let filters=document.querySelectorAll(".filter");
let filter="";
let filterDiv=document.querySelector(".filter-div");

// going to gallery page
galleryBtn.addEventListener("click",function(){
    location.assign("gallery.html");
})

// adding filters listeners
for(let i=0;i<filters.length;i++){
    filters[i].addEventListener("click",function(e){
        filter=e.currentTarget.style.backgroundColor;
        filterDiv.style.backgroundColor=filter;
    })
}

// zoom functions
zoomIn.addEventListener("click",function(){
    if(maxZoom>currZoom){
        currZoom+=0.1;
        video.style.transform=`scale(${currZoom})`;
    }
});

zoomOut.addEventListener("click",function(){
    if(minZoom<currZoom){
        currZoom-=0.1;
        video.style.transform=`scale(${currZoom})`;
    }
})

// initializing video and mediaRecorder
navigator.mediaDevices
.getUserMedia(constraints)
.then(function (mediaStream) {
    video.srcObject = mediaStream;

    // initializing mediaRecorder and its events
    let options = { mimeType: "video/webm; codecs=vp9" };

    mediaRecorder = new MediaRecorder(mediaStream,options);

    mediaRecorder.addEventListener("dataavailable", function (e) {
        chunks.push(e.data);
    });

    mediaRecorder.addEventListener("stop", function () {
        let blob = new Blob(chunks, { type: "video/mp4" });
        addMedia("vid",blob);
        chunks = [];

        // let url = URL.createObjectURL(blob);

        // let a = document.createElement("a");
        // a.href = url;
        // a.download = "video.mp4";
        // a.click();
        // a.remove();
    });
});


vidBtn.addEventListener("click", function () {
    let innerDiv=vidBtn.querySelector("div.anim");
    if (isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        innerDiv.classList.remove("record-animation");
    } else {
        // removing filter when video starts
        filter="";
        filterDiv.style.backgroundColor="";

        // removing zoom
        currZoom=1;
        video.style.transform=`scale(${currZoom})`;

        mediaRecorder.start();
        isRecording = true;
        innerDiv.classList.add("record-animation");
    }
});

capBtn.addEventListener("click",function(){

    // adding animation before calling capture function
    let innerDiv=capBtn.querySelector("div.anim");
    innerDiv.classList.add("capture-animation");
    setTimeout(function(){
        innerDiv.classList.remove("capture-animation");
    },500);


    capture();
})

function capture(){
    // initializing canvas
    let c=document.createElement("canvas");
    c.height=video.videoHeight;
    c.width=video.videoWidth;
    let ctx=c.getContext("2d");

    // handling zoom for scaling in canvas "important"
    ctx.translate(c.width/2,c.height/2);
    ctx.scale(currZoom,currZoom);
    ctx.translate( -c.width / 2 , -c.height / 2 );

    // ḍrawing img on canvas
    ctx.drawImage(video,0,0);

    // adding filter if exists
    if(filter!=""){
        ctx.fillStyle=filter;
        ctx.fillRect(0,0,c.width,c.height);
    }

    addMedia("img",c.toDataURL());

    // download image
    // let a=document.createElement("a");
    // a.href=c.toDataURL();
    // a.download="image.jpg";
    // a.click();
    // a.remove();
}

