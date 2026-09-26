<?php
namespace App\Models;
 
use Illuminate\Database\Eloquent\Model;
 
class Task extends Model
{
    protected $table = 'tasks';
    protected $primaryKey = 'taskID';
    public $timestamps = false;
 
    protected $fillable = [
        'taskName',
        'description',
        'status',
        'dueDate',
    ];
 
    public function getRouteKeyName()
    {
        return 'taskID';
    }
}