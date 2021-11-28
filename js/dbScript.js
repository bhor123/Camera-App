let container=document.querySelector(".container");

let request=indexedDB.open("Camera",1);
let dbAccess;
request.addEventListener("success",function(){
    dbAccess=request.result;
})

request.addEventListener("upgradeneeded",function(){
    let db=request.result;
    db.createObjectStore("gallery",{keyPath:"mId"});
})

request.addEventListener("error",function(){
    alert("error");
})

function addMedia(type,media){
    let tx=dbAccess.transaction("gallery","readwrite");
    let galleryObjectStore=tx.objectStore("gallery");
    let data={
        mId:Date.now(),
        type,
        media
    }
    galleryObjectStore.add(data);
}

function viewMedia(){
    let tx=dbAccess.transaction("gallery","readonly");
    let galleryObjectStore=tx.objectStore("gallery");
    let req=galleryObjectStore.openCursor();

    req.addEventListener("success",function(){
        let cursor=req.result;

        if(cursor){
            let div=document.createElement("div");
            div.classList.add("media-card");
            div.innerHTML=`
                <div class="media-card">
                    <div class="media-container"></div>
                    <div class="action-container">
                        <button class="media-download">Download</button>
                        <button class="media-delete" data-id="${cursor.value.mId}" >Delete</button>
                    </div>
                </div>
            `
            let mediaContainer=div.querySelector(".media-container");
            let downloadBtn=div.querySelector(".media-download");

            if(cursor.value.type=="img"){
                let img=document.createElement("img");
                img.src=cursor.value.media;
                img.classList.add("media-gallery");
                mediaContainer.appendChild(img);

                downloadBtn.addEventListener("click",function(){
                    let a=document.createElement("a");
                    a.href=img.src;
                    a.download="image.jpg";
                    a.click();
                    a.remove();
                })

            }
            else{
                let video=document.createElement("video");
                video.src=URL.createObjectURL(cursor.value.media);
                video.autoplay=true;
                video.loop=true;
                video.controls=true;
                video.classList.add("media-gallery");
                mediaContainer.appendChild(video);

                downloadBtn.addEventListener("click",function(){
                    let a=document.createElement("a");
                    a.href=video.src;
                    a.download="video.mp4";
                    a.click();
                    a.remove();
                })
            }

            let deleteBtn=div.querySelector(".media-delete");
            deleteBtn.addEventListener("click",function(){
                let mId=this.getAttribute("data-id");
                div.remove();
                deleteMediaFromDB(mId);
            })

            container.appendChild(div);
            cursor.continue();
        }
    })
}

function deleteMediaFromDB(mId){
    let tx=dbAccess.transaction("gallery","readwrite");
    let galleryObjectStore=tx.objectStore("gallery");
    galleryObjectStore.delete(Number(mId));
}