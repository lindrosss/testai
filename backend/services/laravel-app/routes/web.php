<?php

use Illuminate\Support\Facades\Route;

Route::get('/admin', function () {
    return redirect('/admin/login');
});
