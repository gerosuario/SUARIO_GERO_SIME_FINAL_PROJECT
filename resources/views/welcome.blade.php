<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>GERO TASKMANAGER</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{{ asset('css/app.css') }}">
</head>
<body>

<div id="welcome">
  <svg class="logo reveal" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="48" height="48" rx="12" />
    <path d="M17 29L24.5 36.5L40 20" />
  </svg>
  <h1 class="reveal">GERO TASKMANAGER</h1>
  <p class="reveal">A quiet place to keep track of what's next. Add, edit, and check things off as you go.</p>
  <button class="enter-btn reveal" id="enterBtn">Enter</button>
</div>

<div id="app">
  <div class="wrap">
    <header>
      <svg class="logo-inline" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="48" height="48" rx="12" />
        <path d="M17 29L24.5 36.5L40 20" />
      </svg>
      <h1>GERO TASKMANAGER</h1>
      <span class="count" id="count"></span>
    </header>

    <form class="add-form" id="addForm">
      <input type="text" id="newTask" placeholder="Add a task…" autocomplete="off" />
      <input type="date" id="newDueDate" aria-label="Due date" />
      <button type="submit" class="add-btn">Add</button>
    </form>

    <div class="filters" id="filters">
      <button data-filter="all" class="active">All</button>
      <button data-filter="Pending">Pending</button>
      <button data-filter="Completed">Completed</button>
    </div>

    <div class="list" id="list"></div>
  </div>
</div>

<script src="{{ asset('js/api.js') }}"></script>
</body>
</html>