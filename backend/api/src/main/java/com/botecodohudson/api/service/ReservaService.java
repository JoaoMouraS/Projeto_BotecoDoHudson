package com.botecodohudson.api.service;

import com.botecodohudson.api.model.ReservaModel;
import com.botecodohudson.api.repository.ReservaRepository;
import org.springframework.stereotype.Service;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;

    public ReservaService(ReservaRepository reservaRepository) {
        this.reservaRepository = reservaRepository;
    }

    public ReservaModel criarReserva(ReservaModel reserva) {
        return reservaRepository.save(reserva);
    }
}
