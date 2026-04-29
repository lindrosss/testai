<?php

declare(strict_types=1);

namespace App\Support;

class EmailLogContext
{
    /**
     * @var array<int, string>
     */
    private array $pendingIds = [];

    public function add(string $id): void
    {
        $this->pendingIds[] = $id;
    }

    /**
     * @return array<int, string>
     */
    public function pending(): array
    {
        return $this->pendingIds;
    }

    public function clear(): void
    {
        $this->pendingIds = [];
    }
}

