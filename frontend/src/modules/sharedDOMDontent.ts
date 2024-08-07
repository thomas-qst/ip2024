import {addUser, getAllUsers} from "./fetches.js";
import {clearSelected, selected} from "./frontendFunctions.js";
import {deleteUser} from "./backendFunctions.js";

export default function sharedDOMContent() {
    document.getElementById("cancelSelect")?.addEventListener("click",(ev)=>{
        for(const ID of selected){
            (document.getElementById("checkboxButton-"+ID) as HTMLInputElement).checked = false;
            (document.getElementById("checkboxButton-"+ID)?.nextElementSibling as HTMLLabelElement).classList.add("d-none");
        }
        clearSelected();
        document.getElementById("selectedDiv")?.classList.add("d-none");
    });

    document.getElementById("searchForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
    });
    document.getElementById("userManagement-modal")?.addEventListener("show.bs.modal",async (ev) => {
        const blankDiv = document.getElementById("userManagement-modal-BlankUser") as HTMLDivElement;
        try{
            let res = await getAllUsers();
            let data = await res.json();
            if(res.status == 200){
                for(let i = 0; i < data.data.length; i++){
                    const username = data.data[i].username;
                    let modalBody = blankDiv.parentElement as HTMLDivElement;
                    let newDiv = blankDiv.cloneNode(true) as HTMLDivElement;
                    let rowDiv = newDiv.children[0] as HTMLDivElement;
                    newDiv.id = "userManagement-modal-"+username;
                    (rowDiv.children[0] as HTMLParagraphElement).innerText = username;
                    (rowDiv.children[2] as HTMLButtonElement).id = "userManagement-modal-delete-"+username;
                    (rowDiv.children[2] as HTMLButtonElement).addEventListener("click",deleteUser);
                    newDiv.classList.remove("d-none");
                    modalBody.append(newDiv);
                }
            }

        }catch(e){
            console.error("failed to fetch users, " + e);
        }
    });

    document.getElementById("userManagement-modal")?.addEventListener("hide.bs.modal",async (ev) => {
        const blankDiv = document.getElementById("userManagement-modal-BlankUser") as HTMLDivElement;
        const formDiv = document.getElementById("userManagement-modal-addUserForm") as HTMLFormElement;
        let parentDiv = blankDiv.parentElement as HTMLDivElement;
        parentDiv.innerHTML = "";
        parentDiv.append(formDiv,blankDiv);
    });

    document.getElementById("userManagement-modal-addUserForm")?.addEventListener("submit",async (ev)=>{
        ev.preventDefault();
        const username = (document.getElementById("userManagement-modal-addUserForm-Username") as HTMLInputElement).value;
        const password = (document.getElementById("userManagement-modal-addUserForm-Password") as HTMLInputElement).value;
        (document.getElementById("userManagement-modal-addUserForm-Username") as HTMLInputElement).value = "";
        (document.getElementById("userManagement-modal-addUserForm-Password") as HTMLInputElement).value = "";
        try{
            let res = await addUser(username, password);
            let data = await res.json();
            if(res.status == 201){
                document.getElementById("userManagement-modal-close")?.click();
            }
        }catch(e){
            console.error("failed to add user, " + e);
        }
    });
}