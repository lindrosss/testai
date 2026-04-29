<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MakeUserAdmin extends Command
{
    protected $signature = 'user:make-admin {email : User email}';

    protected $description = 'Grant admin role to a user.';

    public function handle(): int
    {
        $email = (string) $this->argument('email');
        $user = User::query()->where('email', $email)->first();
        if ($user === null) {
            $this->error(__('User not found.'));

            return self::FAILURE;
        }

        $user->forceFill(['role' => 'admin'])->save();

        $this->info(__('User :email is now admin.', ['email' => $email]));

        return self::SUCCESS;
    }
}
