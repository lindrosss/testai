<?php

namespace App\Providers;

use App\Events\EventClosed;
use App\Events\ExpenseConfirmed;
use App\Events\ExpenseCreated;
use App\Events\EventInviteSent;
use App\Events\MemberJoined;
use App\Events\SettlementSuggestionsRecorded;
use App\Events\UserRegistered;
use App\Listeners\SendVerificationEmail;
use App\Modules\Notification\Infrastructure\Listeners\SendEventClosedListener;
use App\Modules\Notification\Infrastructure\Listeners\SendEventInviteListener;
use App\Modules\Notification\Infrastructure\Listeners\SendExpenseConfirmedListener;
use App\Modules\Notification\Infrastructure\Listeners\SendExpenseCreatedListener;
use App\Modules\Notification\Infrastructure\Listeners\SendMemberJoinedListener;
use App\Modules\Notification\Infrastructure\Listeners\SendSettlementListener;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * Avoid merging auto-discovered listeners with $listen (duplicate registration).
     */
    protected static $shouldDiscoverEvents = false;

    /**
     * The event listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        UserRegistered::class => [
            SendVerificationEmail::class,
        ],
        EventInviteSent::class => [
            SendEventInviteListener::class,
        ],
        MemberJoined::class => [
            SendMemberJoinedListener::class,
        ],
        ExpenseCreated::class => [
            SendExpenseCreatedListener::class,
        ],
        ExpenseConfirmed::class => [
            SendExpenseConfirmedListener::class,
        ],
        SettlementSuggestionsRecorded::class => [
            SendSettlementListener::class,
        ],
        EventClosed::class => [
            SendEventClosedListener::class,
        ],
    ];
}
