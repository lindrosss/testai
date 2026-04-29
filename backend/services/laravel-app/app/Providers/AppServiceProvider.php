<?php

namespace App\Providers;

use App\Contracts\EmailQueuePublisherInterface;
use App\Modules\Event\Domain\Repositories\EventRepositoryInterface;
use App\Modules\Event\Infrastructure\Repositories\EventRepository;
use App\Modules\Expense\Domain\Repositories\ExpenseRepositoryInterface;
use App\Modules\Expense\Domain\Repositories\PaymentRepositoryInterface;
use App\Modules\Expense\Domain\Services\BalanceCalculator;
use App\Modules\Expense\Infrastructure\Repositories\ExpenseRepository;
use App\Modules\Expense\Infrastructure\Repositories\PaymentRepository;
use App\Modules\Expense\Infrastructure\Services\CachedBalanceService;
use App\Modules\Expense\Infrastructure\Services\RedisBalanceCache;
use App\Modules\Notification\Infrastructure\Services\RabbitMQPublisher;
use App\Modules\Settlement\Domain\Repositories\SettlementRepositoryInterface;
use App\Modules\Settlement\Domain\Services\TransactionOptimizer;
use App\Modules\Settlement\Infrastructure\Repositories\SettlementRepository;
use App\Services\RabbitMQEmailQueuePublisher;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(
            EventRepositoryInterface::class,
            EventRepository::class
        );

        $this->app->bind(
            ExpenseRepositoryInterface::class,
            ExpenseRepository::class
        );

        $this->app->bind(
            PaymentRepositoryInterface::class,
            PaymentRepository::class
        );

        $this->app->singleton(RedisBalanceCache::class);

        $this->app->bind(
            EmailQueuePublisherInterface::class,
            RabbitMQEmailQueuePublisher::class
        );

        $this->app->bind(
            SettlementRepositoryInterface::class,
            SettlementRepository::class
        );

        $this->app->singleton(RabbitMQPublisher::class);

        $this->app->singleton(TransactionOptimizer::class);

        $this->app->singleton(BalanceCalculator::class);
        $this->app->singleton(CachedBalanceService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
