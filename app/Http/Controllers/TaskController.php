<?php
namespace App\Http\Controllers;
 
use App\Models\Task;
use Illuminate\Http\Request;
 
class TaskController extends Controller
{
    public function index()
    {
        return Task::all();
    }
 
    public function store(Request $request)
    {
        $validated = $request->validate([
            'taskName'    => 'required|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'required|in:Pending,Completed',
            'dueDate'     => 'nullable|date',
        ]);
 
        return Task::create($validated);
    }
 
    public function show(Task $task)
    {
        return $task;
    }
 
    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'taskName'    => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status'      => 'sometimes|in:Pending,Completed',
            'dueDate'     => 'nullable|date',
        ]);
 
        $task->update($validated);
        return $task;
    }
 
    public function destroy(Task $task)
    {
        $task->delete();
        return response()->noContent();
    }
}