<?php

declare(strict_types=1);

namespace App\Modules\Admin\Domain\Policies;

use App\Models\User;

class AdminPolicy
{
    public function accessPanel(User $user): bool
    {
        return $user->role === 'admin' && ! $user->is_blocked;
    }
}
