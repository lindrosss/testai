<?php

declare(strict_types=1);

namespace Tests\Feature\Auth;

use App\Events\UserRegistered;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RegistrationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_registration_flow(): void
    {
        Event::fake([UserRegistered::class]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['user', 'token']);

        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
        ]);

        $userRow = User::query()->where('email', 'test@example.com')->first();
        $this->assertNotNull($userRow);
        $this->assertNull($userRow->email_verified_at);

        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'test@example.com',
            'password' => 'password123',
        ]);

        $loginResponse->assertStatus(200)
            ->assertJsonStructure(['user', 'token']);

        $token = $loginResponse->json('token');
        $this->assertNotEmpty($token);

        $profileResponse = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/auth/user');

        $profileResponse->assertStatus(200)
            ->assertJsonPath('user.email', 'test@example.com');
    }

    public function test_temporary_password_login_verifies_email_until_password_changed(): void
    {
        $user = User::factory()->unverified()->create([
            'email' => 'invited@example.com',
            'password' => 'tempPass123',
            'has_temporary_password' => true,
        ]);

        $loginResponse = $this->postJson('/api/auth/login', [
            'email' => 'invited@example.com',
            'password' => 'tempPass123',
        ]);

        $loginResponse->assertStatus(200)
            ->assertJsonPath('user.has_temporary_password', true);

        $this->assertIsString($loginResponse->json('user.email_verified_at'));
        $this->assertNotSame('', $loginResponse->json('user.email_verified_at'));

        $user->refresh();
        $this->assertNotNull($user->email_verified_at);
        $this->assertTrue($user->has_temporary_password);

        $this->withHeader('Authorization', 'Bearer '.$loginResponse->json('token'))
            ->putJson('/api/auth/profile', [
                'current_password' => 'tempPass123',
                'password' => 'permanentPass123',
                'password_confirmation' => 'permanentPass123',
            ])
            ->assertStatus(200)
            ->assertJsonPath('user.has_temporary_password', false);

        $user->refresh();
        $this->assertFalse($user->has_temporary_password);
        $this->assertTrue(Hash::check('permanentPass123', $user->password));
    }
}
