def compute_time(passangers_in, passangers_out):
    """
    Un bus viaja a 30km/h en promedio, 90km
    recoger pasajeros demora 2 minutos por pasajero
    bajar pasajero demora 1 minuto

    Cuantos minutos demora el bus, dada una cantidad de pasajeros que se subieron
    y otra cantidad de pasajeros que se bajaron
    """
    time = (90/30)*60
    time_passengers = int(passangers_in)*2 + int(passangers_out)
    total = time+time_passengers
    print(f"El bus demora {total} minutos")

passanger_in = input("Digite el numero de pasajeros que suben: ")
passanger_out = input("Digite el numero de pasajeros que bajan: ")
compute_time(passanger_in, passanger_out)
# num1 = input("Digita numero 1")
# num2 = input("Digita numero 2")

# def average(num1, num2):
#     average = (num1+num2)/2
#     print(f"El promedio es: {average}")
# average(int(num1), int(num2))