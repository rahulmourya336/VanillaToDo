/**
 * TODO:
 *  1. Add PWA support [Done]
 * 
 * Error stack:
 *  1. Shake bug fix [Working]
 *  2. Add IDB Support
 *     
 */

window.onload = _ => {
    addTaskUI();
    getUsername();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js');
    }

    // userDB();
}

const addTask = _ => {
    const value = document.getElementById("input_task").value;
    document.getElementById("input_task").value = null;

    // validate input_task
    if (value.length === 0) {
        console.info("Calling Shake" + value);
        shakeTextBox();
        return;
    }

    let localStorageLength = localStorage.length;
    localStorage.setItem(localStorageLength, [title = value, flag = false]);
    console.log(localStorage.length, localStorage.getItem(localStorageLength));
    reRender();

}

const addTaskUI = _ => {
    // Debugging block
    if (!window.indexedDB) {
        window.alert("Your browser doesn't support a stable version of IndexedDB. Store feature will not be available.");
    }
    let parent = document.getElementById('working_task');
    let taskCount = localStorage.length;

    if (!taskCount) {
        let i_ = document.createElement('small');
        i_.className = "text-center text-secondary";
        i_.innerHTML = "List, list, O, list!";
        i_.setAttribute('id', 'working_default');
        parent.append(i_);
    } else {
        const defaultMessage = document.getElementById('working_default');
        if (defaultMessage) {
            defaultMessage.remove();
        }
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {

                parent = document.getElementById('working_task');
                // console.error("Key Value : " + key);
                let flag = localStorage.getItem(key).split(',')[1].trim() === "true";

                if (flag) {
                    // console.warn("Found Completed Task");
                    parent = document.getElementById('completed_task');
                }

                let label_ = document.createElement('label');
                if (flag) {
                    label_ = document.createElement('s');
                }
                label_.className = "form-checkbox";

                const input_ = document.createElement('input');
                input_.type = "checkbox";
                if (flag) {
                    input_.setAttribute('checked', '');
                }

                const icon_ = document.createElement('i');
                icon_.className = "form-icon";
                icon_.setAttribute('onclick', `completedTask(${key})`);

                const button_ = document.createElement('button');
                button_.className = "btn btn-clear float-right tooltip";
                button_.setAttribute('data-tooltip', 'Delete Task');

                // console.log(localStorage)
                label_.innerText = localStorage.getItem(key).split(',')[0];
                console.info("key Value: " + localStorage.getItem(key));
                label_.setAttribute('id', key);
                button_.setAttribute('onclick', `removeTask(${key})`);

                label_.append(input_, icon_, button_);
                parent.appendChild(label_);
            }
        }
    }
}

const reRender = _ => {
    $('#working_task').empty();
    $('#completed_task').empty();
    addTaskUI();
}

const removeTask = (id) => {
    console.warn('Task Removed');
    document.getElementById(id).remove();
    console.log(localStorage.removeItem(id));
    reRender();
}

const completedTask = (id) => {
    console.warn('Task Checked');
    let x = localStorage.getItem(id).split(',')[1];
    console.warn(x);
    if (x === "true") {
        let value = localStorage.getItem(id).split(',')[0].trim();
        localStorage.setItem(id, [title = value, flag = false]);
    } else {
        let value = localStorage.getItem(id).split(',')[0].trim();
        localStorage.setItem(id, [title = value, flag = true]);
    }
    reRender();
}

const resetApp = _ => {
    localStorage.clear();
    console.info("App reset : Success");

    if (document.getElementById('toast')) { document.getElementById('toast').remove(); }

    let el = document.createElement('div');
    el.className = "toast toast-primary text-center";
    el.setAttribute('id', 'toast');
    el.innerText = "App reset :  Success";

    let button_ = document.createElement('button');
    button_.className = "btn btn-clear float-right";
    button_.setAttribute('onclick', 'hide(status_message)');

    el.appendChild(button_);

    let parent = document.getElementById('message');
    parent.appendChild(el);

    setTimeout(_ => location.href = '', 1000);
}

const dynamicUpdate = _ => {
    console.info('Inside dynamic update');
    $("#working").load(".menu");
}

const hide = (target) => {
    document.getElementById(target).remove();
}

/**
 * Utilities methods
 */


const shakeTextBox = _ => {
    $("button[type=submit]").on("click", function (e) {
        e.preventDefault();
        console.warn("Venom");
        if (!$("#input_task").val()) {
            $("input[id=input_task]").addClass("input_shake is-error");
        }
        $("#input_task").on("webkitAnimationEnd oanimationend msAnimationEnd animationend",
            function (e) {
                $("input[id=input_task]")
                    .delay(200)
                    .removeClass("input_shake is-error");
            }
        );

    });
}


const updateAvatar = (username) => {
    // let username = document.getElementById('username').value;

    console.log('Personalized username : ' + username)

    let avatar = document.querySelector('figure');
    if (!username) {
        avatar.setAttribute('data-initial', 'X');
    } else {
        avatar.removeAttribute('data-initial');
        x = sessionStorage.getItem('username') || 'X';
        avatar.setAttribute('data-initial', `${x[0].toUpperCase()}`)
    }
}

const setUsername = _ => {
    let username = document.getElementById('username').value;
    sessionStorage.setItem('username', username);
    updateAvatar(username)
}

const getUsername = _ => {
    let name = sessionStorage.getItem('username');
    if (name) {
        console.log('User Found : ' + name);
        updateAvatar(name);
        document.getElementById('username').value = name;
    }
}

const notify = (message_, className_, elementID, parentID) => {

    let el = document.createElement('div');
    el.className = className_;
    el.innerText = message_;
    el.setAttribute('id', elementID);

    let parent = document.getElementById(parentID);
    parent.append(el);

    setTimeout(() => {
        hide(parentID)
    }, 1500)
}