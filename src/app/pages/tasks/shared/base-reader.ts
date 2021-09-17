export interface ReaderNavigationConfig {
    metadata: any;
    mode: "test" | "actual";
}

export interface AbstractBaseReaderComponent {
    readerMetadata: ReaderNavigationConfig;

    onSubmit: (arg: any) => void;
}