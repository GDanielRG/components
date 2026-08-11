<?php

declare(strict_types=1);

use Illuminate\Support\Facades\File;

/**
 * @return array{
 *     registry: string,
 *     ref: string,
 *     commit: string,
 *     bundles: list<string>,
 *     files: array<string, string>,
 *     exceptions: array<string, array<string, string>>
 * }
 */
function registrySourceLock(): array
{
    return json_decode(
        File::get(base_path('registry.lock.json')),
        associative: true,
        flags: JSON_THROW_ON_ERROR,
    );
}

/**
 * @param  array<string, string>  $expected
 * @return list<string>
 */
function registrySourceFileDrift(array $expected): array
{
    $drift = [];

    foreach ($expected as $path => $sha256) {
        $absolutePath = base_path($path);

        if (! File::exists($absolutePath)) {
            $drift[] = "{$path} (missing)";

            continue;
        }

        if (hash_file('sha256', $absolutePath) !== $sha256) {
            $drift[] = $path;
        }
    }

    return $drift;
}

it('identifies the registry that owns its installed source', function (): void {
    expect(registrySourceLock()['registry'])->toBe('GDanielRG/components');
});

it('uses immutable registry provenance in CI', function (): void {
    if (! filter_var(getenv('CI'), FILTER_VALIDATE_BOOL)) {
        expect(true)->toBeTrue();

        return;
    }

    $lock = registrySourceLock();

    expect($lock['ref'])
        ->toMatch(
            '/\A(?:[0-9a-f]{40}|snapshot-\d{8}-[0-9a-f]{7,40}|v\d+\.\d+\.\d+(?:-rc\.\d+)?)\z/',
            'Replace the provisional or moving registry ref with an annotated release tag or full commit SHA before CI.',
        )
        ->and($lock['commit'])->toMatch(
            '/\A[0-9a-f]{40}\z/',
            'Registry receipts must record the full resolved source commit.',
        );
});

it('keeps registry-owned source byte-identical to its receipt', function (): void {
    expect(registrySourceFileDrift(registrySourceLock()['files']))->toBe(
        [],
        'Registry-owned source changed outside its registry. Reinstall the owning bundle or declare an intentional exception.',
    );
});

it('pins every declared exception to its approved bytes', function (): void {
    $pinnedFiles = array_map(
        fn (array $exception): string => $exception['sha256'],
        registrySourceLock()['exceptions'],
    );

    expect(registrySourceFileDrift($pinnedFiles))->toBe(
        [],
        'A declared registry exception changed beyond its approved bytes.',
    );
});

it('documents every declared exception', function (): void {
    $incompleteExceptions = [];

    foreach (registrySourceLock()['exceptions'] as $path => $exception) {
        $missingMetadata = array_diff(
            ['sha256', 'reason', 'owner', 'review'],
            array_keys(array_filter($exception)),
        );

        if ($missingMetadata !== []) {
            $incompleteExceptions[] = $path.' (missing: '.implode(', ', $missingMetadata).')';
        }
    }

    expect($incompleteExceptions)->toBe(
        [],
        'Every registry exception must state its reason, owner, review date, and approved SHA-256.',
    );
});
