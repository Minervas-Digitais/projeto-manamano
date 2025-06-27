import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import Notification from "../pages/Notification/Notification";
import api from '../services/api';
import { storage } from '../pages/SignIn/SignIn';

jest.mock("expo-font", () => ({
    useFonts: () => [true],
}));

const mockedNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useFocusEffect: (callback: () => void | (() => void)) => React.useEffect(callback, []),
  useNavigation: () => ({
    navigate: mockedNavigate,
  }),
}));

jest.mock("../../assets/dotsMenuBig.svg", () => "DotsMenuIcon");
jest.mock("../../assets/no-notification-icon.svg", () => "NoNotificationIcon");

jest.mock("../services/api");
jest.mock("../pages/SignIn/SignIn");

const mockedApi = api as jest.Mocked<typeof api>;
const mockedStorage = storage as jest.Mocked<typeof storage>;

interface NotificationType {
  id: string;
  senderName: string;
  groupName: string;
  body: string;
  type: "POST" | "WARNING";
  idContent: string | null;
  isRead: boolean;
  createdAt: Date;
}

interface UserType {
  id: string;
  sysRole: "USER" | "ADMIN";
}

describe("Notification", () => {
    const mockUser: UserType = { id: "user-123", sysRole: "USER" };
    const mockAdmin: UserType = { id: "admin-123", sysRole: "ADMIN" };
    const mockNotifications: NotificationType[] = [
        { id: "notif-1", senderName: "Alice", groupName: "grupo1", body: "teste123", type: "POST", idContent: "post-abc", isRead: false, createdAt: new Date() },
        { id: "notif-2", senderName: "Admin", groupName: "geral", body: "warning123", type: "WARNING", idContent: null, isRead: true, createdAt: new Date() },
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        mockedStorage.getString.mockImplementation((key: string) => {
            if (key === "loggedId") return "user-123";
            if (key === "accessToken") return "fake-token";
            return undefined;
        });
    });

    it("Deve renderizar a mensagem de sem notificacoes quando nao ha notificacoes", async () => {
        mockedApi.get
            .mockResolvedValueOnce({ data: [] })
            .mockResolvedValueOnce({ data: mockUser });
        
        const { getByText } = render(<Notification navigation={mockedNavigate} />);

        await waitFor(() => {
            expect(getByText("Você não possui notificações no momento")).toBeTruthy();
        });

        expect(getByText("Retornar para a tela inicial")).toBeTruthy();
    });

    it("Deve renderizar a lista de notificacoes para um usuario comum", async () => {
        mockedApi.get
            .mockResolvedValueOnce({ data: mockNotifications })
            .mockResolvedValueOnce({ data: mockUser });

        const { getByText } = render(<Notification navigation={mockedNavigate} />);

        await waitFor(() => {
            expect(getByText("Notificação")).toBeTruthy();
            expect(getByText("teste123")).toBeTruthy();
            expect(getByText("warning123")).toBeTruthy();
        });
    });

    it("Deve navegar para a tela de Post ao clicar numa notificacao padrao", async () => {
        mockedApi.get
            .mockResolvedValueOnce({ data: mockNotifications })
            .mockResolvedValueOnce({ data: mockUser });

        mockedApi.patch.mockResolvedValue({ data: {} });

        const { findByText } = render(<Notification navigation={mockedNavigate} />);

        const notificationItem = await findByText('Este é um post de teste.');
        fireEvent.press(notificationItem);

        await waitFor(() => {
            expect(mockedApi.patch).toHaveBeenCalledWith(
                'notifications/notif-1',
                { isRead: true },
                expect.any(Object) 
            );
        });

        expect(mockedNavigate).toHaveBeenCalledWith('Post', { postId: 'post-abc' });
    });

    it("Deve navegar para a NotificationPage ao clicar numa notificacao WARNING", async () => {
        mockedApi.get
            .mockResolvedValueOnce({ data: mockNotifications })
            .mockResolvedValueOnce({ data: mockUser });

        mockedApi.patch.mockResolvedValue({ data: {} });

        const { findByText } = render(<Notification navigation={mockedNavigate} />);

        const warningItem = await findByText("warning123");
        fireEvent.press(warningItem);

        await waitFor(() => {
            expect(mockedApi.patch).toHaveBeenCalledWith(
                "notifications/notif-2",
                { isRead: true},
                expect.any(Object)
            );
        });

        expect(mockedNavigate).toHaveBeenCalledWith("NotificationPage");
    });

    it("Deve renderizar a tela especifica para ADMIN", async () => {
        mockedStorage.getString.mockImplementation((key: string) => {
            if (key === 'loggedId') return 'admin-123';
            if (key === 'accessToken') return 'admin-fake-token';
            return undefined;
        });

        mockedApi.get
            .mockResolvedValueOnce({ data: mockNotifications })
            .mockResolvedValueOnce({ data: mockAdmin });

        const { getByText } = render(<Notification navigation={mockedNavigate} />);

        await waitFor(() => {
            expect(getByText("Comunicados")).toBeTruthy();
        });
    });

    it("Deve chamar a funcao de buscar notificacoes periodicamente", async () => {
        jest.useFakeTimers();
        mockedApi.get.mockResolvedValue({ data: [] });
        
        render(<Notification navigation={mockedNavigate} />);

        await waitFor(() => {
            // useFocusEffect + primeiro fetchNotifications + fetchUserInfo
            expect(mockedApi.get).toHaveBeenCalledTimes(2);
        });

        act(() => {
            // Avanca o tempo do setInterval
            jest.advanceTimersByTime(1000);  
        });
        
        await waitFor(() => {
            expect(mockedApi.get).toHaveBeenCalledTimes(3);
        });

        jest.useRealTimers();
    });
})