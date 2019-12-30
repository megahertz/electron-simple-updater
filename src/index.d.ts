import { EventEmitter } from 'events';

declare namespace SimpleUpdater {
  interface Logger {
    error(...args: any): void;
    warn(...args: any): void;
    info(...args: any): void;
    debug(...args: any): void;
  }

  interface Meta {
    update: string;
    version: string;
  }

  interface Options {
    /**
     * Automatically download an update when it's' found in updates.json
     */
    autoDownload: boolean;

    /**
     * An application which is built for channel like 'beta' will receive updates
     * only from this channel
     */
    channel: string;

    /**
     * Check for updates immediately when init() is called
     */
    checkUpdateOnStart?: boolean;

    /**
     * Disable update feature. This option is set to true automatically for
     * non packaged application and builds for Mac App Store or Windows Store
     */
    disabled?: boolean;

    /**
     * You can pass
     * [electron-log]{@link https://github.com/megahertz/electron-log},
     * [winston]{@link https://github.com/winstonjs/winston} or another logger.
     *
     * Set it to false if you would like to disable a logging feature
     */
    logger: Partial<Logger> | false;

    /**
     * Current app version. In most cases, you should not pass this options
     * manually, it is read by electron from version at package.json
     */
    version: string;

    /**
     * The only required parameter. This is a URL updates.json file
     */
    url: string;
  }

  interface SimpleUpdater extends EventEmitter {
    /**
     * ${platform}-${arch}
     */
    readonly build: string;

    /**
     * ${build}-${channel}-${version}
     */
    readonly buildId: string;

    /**
     * The current updates channel
     */
    readonly channel: string;

    /**
     * The current app version
     */
    readonly version: string;

    /**
     * Initialize a package.
     * By default it finish the process if run by Squirrel.Windows installer
     * @fires SimpleUpdater#error:Event
     */
    init(options?: Partial<Options>): this;

    /**
     * Asks the server whether there is an update. url must be set before
     * this call
     * @fires SimpleUpdater#error:Event
     * @fires SimpleUpdater#checking-for-update:Event
     * @fires SimpleUpdater#update-not-available:Event
     */
    checkForUpdates(): this;

    /**
     * Start downloading update manually.
     * You can use this method if autoDownload option is set to false
     * @fires SimpleUpdater#update-downloading:Event
     * @fires SimpleUpdater#update-downloaded:Event
     * @fires SimpleUpdater#error:Event
     */
    downloadUpdate(): this;

    /**
     * Restarts the app and installs the update after it has been downloaded.
     * It should only be called after update-downloaded has been emitted.
     */
    quitAndInstall(): void;

    /**
     * Set one or a few options
     */
    setOptions(options: Options): this;
    setOptions(name: keyof Options, value: any): this;

    /**
     * Return the current updates.json URL
     */
    getFeedURL(): string;
  }
}

// Merge namespace with interface
declare const SimpleUpdater: SimpleUpdater.SimpleUpdater & {
  default: SimpleUpdater.SimpleUpdater;
}

export = SimpleUpdater;
