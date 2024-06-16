let username : string;

async function getUsername() {
    if(document.cookie.length == 0){
        window.location.href = '/index.html';
        return;
    }
    try{
        const res : Response = await fetch("http://localhost:8888/login/username", {
            method: 'get',
            mode: 'cors',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        const data = await res.json();
        if(res.ok){
            username =  data.data[0].username;
        }else{
            window.location.href = '/index.html';
        }
    }catch(error){
        console.error('Failed to fetch username', error);
        window.location.href = '/index.html';
    }

}

document.addEventListener('DOMContentLoaded', async () => {
    await getUsername();
    const userElement = document.getElementById("user");
    if(userElement != null){
        userElement.innerText = username;
    }
});


