package fr.syncheo.ewm.childitem.server;

import java.io.IOException;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.ibm.team.repository.service.TeamRawService;
/**
 * Service côté serveur pour récupérer ou calculer les enfants d'un workitem
 */
public class ChildItemService extends TeamRawService implements IChildItemService {

    @Override
    public void perform_GET(String uri, HttpServletRequest request, HttpServletResponse response) 
            throws IOException {

        // Exemple : calcul ou récupération de données côté serveur
        String result = "{\"status\":\"ok\", \"childrenCount\": 5}";

        response.setCharacterEncoding(StandardCharsets.UTF_8.toString());
        response.setContentType("application/json");
        // Configurer la réponse

        PrintWriter writer = response.getWriter();
        writer.write(result);
    }

    // Tu peux ajouter d'autres méthodes pour POST, PUT, etc.
}