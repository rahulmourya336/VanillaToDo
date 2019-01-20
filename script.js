/**
 * TODO:
 *  1. Add PWA support [Done]
 * 
 * Error stack:
 *  1. Shake bug fix [Done] :D
 *  2. Add IDB Support [Working]
 *  3. Fix personalize bug     
 */

window.onload = _ => {
    console.warn('Sentry Init');
    Sentry.init({ dsn: 'https://d94cebbe07ba44a4a2b837b183f90580@sentry.io/1374255' });
    addTaskUI();
    getUsername();

    // Uncomment to run service worker
    // if ('serviceWorker' in navigator) {
    //     navigator.serviceWorker.register('./service-worker.js');
    // }

    // userDB();
}

const addTask = _ => {
    value = document.getElementById("input_task").value.trim();
    document.getElementById("input_task").value = null;

    // validate input_task
    if (value.length === 0) {
        shakeTextBox();
        return;
    }

    let flag = checkRedundantTask(value);
    if (flag) {
        console.warn('Duplicate entry : Raising notification');
        hideInput(true);
        notify('Task already exist!', 'text-left text-error', 'same-task', value);
        return;
    }
    putEntryLS(value);
}

const hideInput = (flag) => {
    if(flag) {
        $('#input_task').hide();
        $('#btn-submit-task').hide();
        console.info("%c HIDE : Primary input hidden", 'background: #5c6bc0; color: #fff');
    } else {
        $('#input_task').show();
        $('#btn-submit-task').show();
        console.info("%c SHOW : Primary input visible",'background: #5c6bc0; color: #fff');
    }
}

const checkRedundantTask = (value) => {
    let flag = false;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            let transform = localStorage.getItem(key).split(',')[0];
            transform = transform.replace(/\ˏ/g, ',');
            if (value.toLowerCase() === transform.toLowerCase()) {
                flag = true;
                break;
            }
        }
    }
    return flag;
}

const putEntryLS = (value) => {
    // Fix Comma issue
    value = value.replace(/\,/g, 'ˏ');

    let localStorageLength = localStorage.length;
    localStorage.setItem(localStorageLength, [title = value, flag = false]);
    console.log(localStorage.length, localStorage.getItem(localStorageLength));
    reRender();
}

const redundantTask = (response) => {
    document.getElementById('same-task').remove();
    document.getElementById('secondary-divider').remove();
    hideInput(false);

    if (typeof response === 'string') { putEntryLS(response); }
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
                label_.className = "form-checkbox text-wrap";

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

                const editIcon_ = document.createElement('i');
                editIcon_.className = "icon icon-edit btn-clear float-right ";
                editIcon_.setAttribute('onclick', `editTask(${key})`);

                label_.innerText = localStorage.getItem(key).split(',')[0];
                console.info(`key Value:  ${localStorage.getItem(key)},  Key :  ${key}`);
                label_.setAttribute('id', key);
                button_.setAttribute('onclick', `removeTask(${key})`);
                label_.append(input_, icon_, button_, editIcon_);
                parent.appendChild(label_);
            }
        }
    }
}

const cancelEdit = _ => {
    if (document.getElementById('cancel_edit').childElementCount) {
        $('#cancel_edit').empty();
        reRender();
    }
}

const reRender = _ => {
    $('#working_task').empty();
    $('#completed_task').empty();
    hideInput(false);
    addTaskUI();
}

const removeTask = (id) => {
    console.warn('Task Removed');
    localStorage.removeItem(id);
    document.getElementById(id).remove();
    reRender();
}

const completedTask = (id) => {
    // console.warn('Task Checked');
    let x = localStorage.getItem(id).split(',')[1];
    console.warn(x);

    let flag_;
    let value = localStorage.getItem(id).split(',')[0].trim();
    x === "true" ? flag_ = false : flag_ = true;

    localStorage.setItem(id, [title = value, flag = flag_]);
    reRender();
}

const editTask = (id) => {
    cancelEdit(); // Clear cancel edit button, to prevent overpopulation in UI.
    let el = document.getElementById('btn-submit-task');
    el.innerText = "Update";
    el.className = "btn btn-success input-group-btn";
    el.setAttribute('onclick', `updateTask(${id})`);

    let value = localStorage.getItem(id).split(',')[0];
    value = value.replace(/\ˏ/g, ',');
    document.getElementById('input_task').value = value;
    document.getElementById('input_task').focus();

    // Add cancel edit
    let parent = document.getElementById('cancel_edit');

    const span_ = document.createElement('span');
    span_.className = "mr-2 btn btn-primary";
    span_.setAttribute('onclick', `cancelEdit();resetSubmitButton();reRender()`);

    const i_ = document.createElement('i');
    i_.className = 'icon icon-cross';

    span_.append(i_);

    parent.appendChild(span_);
}

const updateTask = (id) => {
    let newValue = document.getElementById('input_task').value.trim();
    newValue = newValue.replace(/\,/g, 'ˏ');

    // Check for null entry
    if (newValue === '') {
        shakeTextBox();
        return;
    }

    if (!localStorage.getItem(id)) {
        let el = document.getElementById('status');
        el.innerText = 'Task already deleted! ¯\\_(ツ)_/¯';
        el.className = 'text-error';
        setTimeout(_ => { $('#status').empty() }, 1500);
        cancelEdit();
        resetSubmitButton();
        return;
    }

    let taskStatus = localStorage.getItem(id).split(',')[1];
    localStorage.setItem(id, [newValue, taskStatus]);
    resetSubmitButton();
    cancelEdit();
    reRender();
}

const checkClassName = (elementID, className_) => {
    let classList_ = document.getElementById(elementID).className;
    classList_ = classList_.split(' ');
    return classList_.filter(x => x === className_).length;
}

const resetSubmitButton = _ => {
    let el = document.getElementById('btn-submit-task');
    el.innerText = "Add Task";
    el.className = "btn btn-primary input-group-btn";
    el.setAttribute('onclick', `addTask()`);
    // Reset input too!
    document.getElementById("input_task").value = null;
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

const hide = (target) => {
    document.getElementById(target).remove();
}

/**
 * Utilities methods
 */


const shakeTextBox = _ => {
    let e = document.getElementById("btn-submit-task");
    console.warn("Venom");
    document.getElementById("input_task").className = 'form-input input_shake is-error';

    document.getElementById('input_task').addEventListener('animationend', (e) => {
        setTimeout(_ => { }, 100);
        document.getElementById("input_task").className = 'form-input';
    });
}


const updateAvatar = (username) => {
    // let username = document.getElementById('username').value;

    // console.log('Personalized username : ' + username)

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



const notify = (message_, className_, elementID, value_) => {
    const divider = document.createElement('div');
    divider.className = "divider";
    divider.setAttribute('id', 'secondary-divider');

    const el = document.createElement('div');
    el.className = className_;
    el.innerText = message_;
    el.setAttribute('id', elementID);

    let btn_accept = document.createElement('button');
    let btn_discard = document.createElement('button');

    btn_accept.className = 'btn btn-primary float-right btn-sm';
    btn_discard.className = 'btn btn-link float-right mx-2 btn-sm';

    btn_accept.setAttribute('onclick', `redundantTask('${value_}')`);
    btn_discard.setAttribute('onclick', `redundantTask(false)`);

    btn_accept.setAttribute('id', 'cancel-btn-true');

    $('#cancel-btn-true').on('click', value_, redundantTask);

    btn_accept.innerText = "Add";
    btn_discard.innerText = 'Discard';

    el.append(btn_accept, btn_discard);

    document.getElementById('status').append(el);

    document.getElementById('notification').append(divider);
}
