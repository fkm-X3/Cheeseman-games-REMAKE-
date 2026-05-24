/* tslint:disable */
/* eslint-disable */

export function game_loop(): void;

export function get_achievements_html(): string;

export function get_cube_details_html(cube_id: number): string;

export function get_cubes_grid_html(): string;

export function get_dev(): boolean;

export function get_selected_cube_id(): number;

export function get_tester(): boolean;

export function go_to_menu(): void;

export function handle_key_down(key: string): void;

export function handle_key_up(key: string): void;

export function hide_menu(): void;

export function init_game(canvas_id: string): void;

export function init_menu(): void;

export function init_progress(): void;

export function main(): void;

export function nav_to(screen_id: string): void;

export function prepare_game(mode: string, _from_screen: string): void;

export function reset_all_progress(): void;

export function restart_game(): void;

export function select_cube(id: number): void;

export function set_dev(enabled: boolean): void;

export function set_selected_cube(id: number): void;

export function set_tester(enabled: boolean): void;

export function show_game_over(winner: string): void;

export function show_menu(): void;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly game_loop: () => [number, number];
    readonly get_achievements_html: () => [number, number];
    readonly get_cube_details_html: (a: number) => [number, number];
    readonly get_cubes_grid_html: () => [number, number];
    readonly get_dev: () => number;
    readonly get_selected_cube_id: () => number;
    readonly get_tester: () => number;
    readonly go_to_menu: () => [number, number];
    readonly handle_key_down: (a: number, b: number) => [number, number];
    readonly handle_key_up: (a: number, b: number) => [number, number];
    readonly hide_menu: () => [number, number];
    readonly init_game: (a: number, b: number) => [number, number];
    readonly init_menu: () => [number, number];
    readonly init_progress: () => [number, number];
    readonly main: () => void;
    readonly nav_to: (a: number, b: number) => [number, number];
    readonly prepare_game: (a: number, b: number, c: number, d: number) => [number, number];
    readonly reset_all_progress: () => [number, number];
    readonly restart_game: () => [number, number];
    readonly select_cube: (a: number) => [number, number];
    readonly set_dev: (a: number) => [number, number];
    readonly set_tester: (a: number) => [number, number];
    readonly show_game_over: (a: number, b: number) => [number, number];
    readonly show_menu: () => [number, number];
    readonly set_selected_cube: (a: number) => [number, number];
    readonly __wbindgen_exn_store: (a: number) => void;
    readonly __externref_table_alloc: () => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
