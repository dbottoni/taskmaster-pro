var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    //console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

var auditTask = function(taskEl){

  // get date from task element
  var date = $(taskEl).find("span").text().trim();
  // convert to moment object at 5:00pm
  var time =  moment(date, "L").set("hour", 17);
  // remove any olf classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");
  // apply new clss if task is near/over due date
  if (moment().isAfter(time)){
    $(taskEl).addClass("list-group-item-danger");
  } 
  else if
    (Math.abs(moment().diff(time,"days")) <=2){
      $(taskEl).addClass("list-group-item-warning");
    }
};


$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance:"pointer",
  helper: "close",
  activate: function(event, ui){
    console.log(ui);
  },
  deactivate : function(event, ui){
    console.log(ui);
  },
  over: function(event){
    console.log(event);
  },
  out: function(event){
    console.log(event);
  },
  update: function(){
    var tempArr = [];

    $(this).children().each(function(){
      var text = $(this)
      .find("p")
      .text()
      .trim();

      var date = $(this)
      .find("span")
      .text()
      .trim();

      tempArr.push({
        text: text,
        date: date
      });
    });

    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

      tasks[arrName] = tempArr;
      saveTasks();
  }
});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
  },
  over: function(event, ui) {
    console.log(ui);
  },
  out: function(event,ui) {
    console.log(ui);
  }
});

// convert text field into a jquery date picker
$("#modalDueDate").datepicker({
  minDate: 1
});

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();

  }
});
// task text was clicked
$(".list-group").on("click", "p", function() {
  // get current text of p element
  var text = $(this)
    .text()
    .trim();   
    
    // $("<textarea>") create element using name as a selecter. replace p element with a new textarea
    var textInput = $("<textarea>").addClass("form-control").val(text);
    // append $(<"textarea">) to the page
    $(this).replaceWith (textInput);
    // auto focus on new element
    textInput.trigger("focus");
});

// editable field was un-focused
$(".list-group").on("blur", "textarea", function() {
  //get current value of textarea
  var text = $(this).val();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();
    // indicates that we want t update the "tasks" object, but since we don't know the variables 
    // being entered, we write it as shown below. Refer to 5.1.6 notes
    tasks[status][index].text = text;
    saveTasks();
    // recreate p element
    var taskP = $("<p>")
    .addClass("m-1")
    .text(text);

    // replace textarea with p element
    $(this).replaceWith(taskP);
});

// due date was clicked
$(".list-group").on("click", "span", function()  {
  // get current text
  var date = $(this)
  .text()
  .trim();

  // creat new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);
    // swap out elements
  $(this).replaceWith(dateInput);

    // enable jquery ui date picker
    dateInput.datepicker({
      minDate: 1,
      onClose: function(){
        $(this).trigger("change");
      }
    });

    //automatically focus on new element
    dateInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("change", "input[type='text']", function() {
  //get current text
  var date = $(this)
  .val()
  .trim();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");
  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();
  // update the task's position in the list of other li elements
  tasks[status][index].date = date;
  saveTasks();

  //recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
  //replace input with span element
  $(this).replaceWith(taskSpan);
  auditTask($(taskSpan).closest(".list-group-item"));
});


// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});




// load tasks for the first time
loadTasks();


