// Copyright (c) 2023. Heusala Group Oy <info@hg.fi>. All rights reserved.

import { addStateService } from "./addStateService";
import { AutowireServiceImpl } from "./services/AutowireServiceImpl";
import { LogLevel } from "../../types/LogLevel";

// Mocked implementations

jest.mock('./services/AutowireServiceImpl', () => ({
    ...jest.requireActual('./services/AutowireServiceImpl'),
    AutowireServiceImpl: {
        ...jest.requireActual('./services/AutowireServiceImpl').AutowireServiceImpl,
        getAutowireService: jest.fn().mockImplementation(() => ({
            getName: jest.fn().mockImplementation((name: any) => name === 'parsedArgs' ? {} : undefined),
            setName: jest.fn(),
            deleteName: jest.fn(),
            hasName: jest.fn()
        })),
    },
}));

// Unit tests
describe('addStateService', () => {

    beforeAll( () => {
        addStateService.setLogLevel(LogLevel.NONE);
    });

    it('should properly create the service and perform state changes', async () => {
        // Prepare
        const createStateService = jest.fn();
        const createDTO = jest.fn();
        const isDTO = jest.fn();
        const explainDTO = jest.fn();
        const mockStateService = { on: jest.fn(), getDTO: jest.fn(), destroy: jest.fn() };
        const mockAutowireService = {
            getName: jest.fn().mockImplementation((name: any) => name === 'parsedArgs' ? {} : undefined),
            setName: jest.fn(),
            deleteName: jest.fn(),
            hasName: jest.fn()
        };
        const readFile = jest.fn();
        const writeFile = jest.fn();

        createStateService.mockReturnValue(mockStateService);
        createDTO.mockReturnValue({});
        isDTO.mockReturnValue(true);
        explainDTO.mockReturnValue('OK');
        (readFile as any).mockResolvedValue(JSON.stringify({}));
        (AutowireServiceImpl as any).getAutowireService.mockReturnValue(mockAutowireService);

        // Decorate method
        class MyClass {
            @addStateService(
                'myState',
                createStateService,
                createDTO,
                isDTO as any,
                explainDTO,
                readFile,
                writeFile
            )
            public static async run() {}
        }

        // Execute
        await MyClass.run();

        // Assert
        expect(createStateService).toHaveBeenCalledTimes(1);
        expect(createDTO).not.toHaveBeenCalled();
        expect(isDTO).toHaveBeenCalledTimes(1);
        expect(explainDTO).not.toHaveBeenCalled();
        expect(mockAutowireService.setName).toHaveBeenCalledTimes(2);
        expect(mockAutowireService.deleteName).toHaveBeenCalledTimes(2);
        expect(mockStateService.destroy).toHaveBeenCalledTimes(1);

    });

    it('should throw an error if state file is not valid DTO', async () => {
        // Prepare
        const createStateService = jest.fn();
        const createDTO = jest.fn();
        const isDTO = jest.fn();
        const explainDTO = jest.fn();
        const readFile = jest.fn();
        const writeFile = jest.fn();

        createDTO.mockReturnValue({});
        isDTO.mockReturnValue(false);
        explainDTO.mockReturnValue('Not valid DTO');
        readFile.mockResolvedValue(JSON.stringify({}));

        // Decorate method
        class MyClass {
            @addStateService(
                'myState',
                createStateService,
                createDTO,
                isDTO as any,
                explainDTO,
                readFile,
                writeFile
            )
            public static async run() {}
        }

        // Execute and assert
        await expect(MyClass.run()).rejects.toThrow('Not valid DTO');

        expect(createDTO).not.toHaveBeenCalled();

    });

    it('should write new state to file when state changes', async () => {

        // Prepare
        const createStateService = jest.fn();
        const createDTO = jest.fn();
        const isDTO = jest.fn();
        const explainDTO = jest.fn();
        const mockStateService = {
            on: jest.fn(),
            getDTO: jest.fn().mockReturnValue({ a: 1 }),
            destroy: jest.fn(),
        };
        const mockAutowireService = {
            getName: jest.fn().mockImplementation((name: any) => name === 'parsedArgs' ? {} : undefined),
            setName: jest.fn(),
            deleteName: jest.fn(),
            hasName: jest.fn()
        };
        const readFile = jest.fn();
        const writeFile = jest.fn();

        createStateService.mockReturnValue(mockStateService);
        createDTO.mockReturnValue({});
        isDTO.mockReturnValue(true);
        explainDTO.mockReturnValue('OK');
        readFile.mockResolvedValue(JSON.stringify({}));
        (AutowireServiceImpl as any).getAutowireService.mockReturnValue(mockAutowireService);

        // Decorate method
        class MyClass {
            @addStateService(
                'myState',
                createStateService,
                createDTO,
                isDTO as any,
                explainDTO,
                readFile,
                writeFile
            )
            public static async run() {

                // Simulate state change
                const stateChangeCallback = mockStateService.on.mock.calls[0][1];
                await stateChangeCallback();

            }
        }

        // Execute
        await MyClass.run();

        // Assert
        expect(writeFile).toHaveBeenCalledTimes(1);
        expect(writeFile).toHaveBeenCalledWith(expect.any(String), JSON.stringify({ a: 1 }, null , 2), "utf8");

    });

});
