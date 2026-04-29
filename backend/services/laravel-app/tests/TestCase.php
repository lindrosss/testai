<?php

namespace Tests;

use App\Modules\Expense\Infrastructure\Services\CachedBalanceService;
use App\Modules\Expense\Infrastructure\Services\RedisBalanceCache;
use App\Modules\Notification\Infrastructure\Services\RabbitMQPublisher;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->mock(RedisBalanceCache::class, function ($mock): void {
            $mock->shouldReceive('invalidate')->byDefault();
            $mock->shouldReceive('get')->andReturn(null);
            $mock->shouldReceive('set')->byDefault();
        });
        $this->app->forgetInstance(CachedBalanceService::class);

        $this->app->forgetInstance(RabbitMQPublisher::class);
        $this->mock(RabbitMQPublisher::class, function ($mock): void {
            $mock->shouldReceive('publishEmailSend')->byDefault();
        });
    }
}
