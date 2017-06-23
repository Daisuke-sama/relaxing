/**
 * Created by Royal PR.
 * User: Paul Burilichev
 * Date: 15-Apr-17
 * Time: 4:57 PM
 * URL: http://iroyalpr.com or https://rpr.by
 * Description:
 */

var taskCollection = new TaskCollection();

(function () {
    var form = document.querySelector("form");
    form.addEventListener("submit", function (event) {
        event.preventDefault();
    });

    var button = document.querySelector("form button");
    button.addEventListener("click", function () {
        var task = taskCollection.addItem(getTaskFromForm());
        addNewTaskToList(task);
    });

    try {
        if (window.localStorage['tasks'] !== undefined) {
            var arrCollection = JSON.parse(window.localStorage['tasks']);

            for (let taskObj of arrCollection) {
                var task = new Task();
                task.setId(taskObj.id);
                task.setTitle(taskObj.title);
                task.setDetails(taskObj.details);
                task.setComplete(taskObj.complete);

                taskCollection.addItem(task);
                addNewTaskToList(task);
            }
        }
    } catch (e) {
        alert("Problem with storage: " + e.message);
    }
})();

/**
 * Object represents instance of a Task.
 */
function Task() {
    var id = undefined;
    var title = "Untitled";
    var details = "";
    var complete = false;

    return {
        getId: function () {
            return id;
        },
        getTitle: function () {
            return title;
        },
        getDetails: function () {
            return details;
        },
        isComplete: function () {
            return complete !== false;
        },

        setId: function (newId) {
            id = parseInt(newId);
        },
        setTitle: function (newTitle) {
            title = newTitle.toString();
        },
        setDetails: function (newDetails) {
            details = newDetails.toString();
        },
        setComplete: function (isComplete) {
            complete = !/^(?:f(?:alse)?|no?|0+)$/i.test(isComplete) && !!isComplete;
        },

        copy: function () {
            var newItem = new Task();
            newItem.setTitle(title);
            newItem.setDetails(details);
            newItem.setComplete(complete);

            return newItem;
        }
    }
}

/**
 * Object represent a list of Task instances.
 */
function TaskCollection() {
    var idCounter = 0;
    var collection = [];
    var nextItem = function* () {
        yield* collection;
    };

    return {
        addItem: function (item) {
            if (typeof item === typeof Object() && item.hasOwnProperty("setId")) {
                var newItem = item.copy();
                ++idCounter;
                newItem.setId(idCounter);
                collection.push(newItem);

                return newItem;
            } else {
                throw TypeError("Wrong type of object!");
            }
        },
        deleteItem: function (id) {
            for (var i = 0; i < collection.length; i++) {
                if (collection[i].getId() === parseInt(id)) {
                    collection.splice(i, 1);
                    break;
                }
            }
        },
        changeItem: function (item) {
            if (typeof item === typeof Object() && item.hasOwnProperty("setId")) {
                var task = this.getItem(item.getId());
                if (task !== undefined) {
                    task.setTitle(item.getTitle());
                    task.setDetails(item.getDetails());
                    task.setComplete(item.isComplete());
                }
            } else {
                throw TypeError("Wrong type of object!");
            }
        },
        getItem: function (id) {
            for (var i = 0; i < collection.length; i++) {
                if (collection[i].getId() === parseInt(id)) {
                    return collection[i];
                }
            }
            return undefined;
        },
        getNextItem: function () {
            return nextItem();
        }
    }
}


/**
 * Function adds new task from the form to the list in html and task collection.
 */
function addNewTaskToList(task) {
    var row = document.createElement("tr");
    var tBody = document.querySelector("tbody");
    var tds = [];

    // generate sequence number for the task.
    var nextNum = tBody.children.length + 1;
    tds.push(document.createElement("td"));
    tds[0].innerText = nextNum;

    // element with ID of the task
    tds.push(document.createElement("td"));
    tds[1].innerText = task.getId();
    var rowId = "task" + task.getId();
    row.setAttribute("id", rowId);

    // element with TITLE of the task
    tds.push(document.createElement("td"));
    tds[2].innerText = task.getTitle();

    // element with DETAILS of the task
    tds.push(document.createElement("td"));
    tds[3].innerText = task.getDetails();

    // control elements
    tds.push(document.createElement("td"));

    var checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    if (task.isComplete() === true) {
        checkbox.setAttribute("checked", "checked");
        row.style.textDecoration = "line-through";
    }
    var boxId = "cb-" + rowId;
    checkbox.setAttribute("id", boxId);
    checkbox.addEventListener("click", toCompleteTheTask.bind(this, rowId, task.getId()));
    var div = document.createElement("div");
    div.setAttribute("class", "checkbox");
    var label = document.createElement("label");
    label.setAttribute("for", boxId);
    label.innerHTML = "Complete";
    label.prepend(checkbox);
    div.append(label);

    var button = document.createElement("button");
    button.setAttribute("class", "btn btn-danger");
    button.innerHTML = "Delete";
    tds[4].append(div);
    tds[4].append(button);

    button.addEventListener("click", deleteTheTask.bind(this, rowId, task.getId()));

    // fill new row
    for (let i = 0; i < tds.length; i++) {
        row.append(tds[i]);
    }
    tBody.append(row);

    saveToLocalStorage();
}

function deleteTheTask(textId, taskId) {
    (document.getElementById(textId)).remove();
    taskCollection.deleteItem(taskId);

    saveToLocalStorage();
}

function toCompleteTheTask(textId, taskId) {
    var task = taskCollection.getItem(taskId);
    var box = document.getElementById("cb-" + textId);
    var row = document.getElementById(textId);
    if (box.checked === true) {
        row.style.textDecoration = "line-through";
        task.setComplete(true);
    } else {
        row.style.textDecoration = "none";
        task.setComplete(false);
    }
    taskCollection.changeItem(task);

    saveToLocalStorage();
}

function getTaskFromForm() {
    var title = document.getElementById("inputTitle");
    if (title.value === "") {
        alert("You must input title of a task!");
        title.focus();
        throw SyntaxError("Title was empty.");
    }

    var details = document.getElementById("inputDetails");
    if (details.value === "") {
        alert("You must input details for task!");
        details.focus();
        throw SyntaxError("Details was empty.");
    }

    var task = new Task();
    task.setTitle(title.value);
    task.setDetails(details.value);

    title.value = details.value = "";
    title.focus();

    return task;
}


function saveToLocalStorage() {
    var col = [];
    for (task of taskCollection.getNextItem()) {
        col.push({
            id: task.getId(),
            title: task.getTitle(),
            details: task.getDetails(),
            complete: task.isComplete()
        });
    }

    try {
        window.localStorage.setItem("tasks", JSON.stringify(col));
    } catch (e) {
        alert("Problem with storage");
    }
}