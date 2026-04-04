"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/shared/button";
import type { AppLocale } from "@/lib/i18n/config";
import type { LocationPoint } from "@/types/telegram-webapp";

type YMapClickEvent = {
  get: (key: "coords") => [number, number];
};

type YPlacemarkInstance = {
  geometry: {
    setCoordinates: (coords: [number, number]) => void;
  };
};

type YMapInstance = {
  events: {
    add: (event: "click", handler: (event: YMapClickEvent) => void) => void;
  };
  geoObjects: {
    add: (object: YPlacemarkInstance) => void;
  };
  setCenter: (coords: [number, number], zoom?: number, options?: { duration?: number }) => void;
  destroy: () => void;
};

type YMapsGlobal = {
  ready: (callback: () => void) => void;
  Map: new (
    element: HTMLElement,
    state: {
      center: [number, number];
      zoom: number;
      controls: string[];
    },
    options: { suppressMapOpenBlock: boolean },
  ) => YMapInstance;
  Placemark: new (
    coords: [number, number],
    properties: Record<string, unknown>,
    options: { preset: string },
  ) => YPlacemarkInstance;
};

function getYMaps() {
  return (window as Window & { ymaps?: YMapsGlobal }).ymaps ?? null;
}

export function LocationPickerPlaceholder({
  locale,
  title,
  hint,
  actionLabel,
  pickedLabel,
  location,
  onSelectLocation,
  onPickLocation,
}: {
  locale: AppLocale;
  title: string;
  hint: string;
  actionLabel: string;
  pickedLabel: string;
  location: LocationPoint | null;
  onSelectLocation: (location: LocationPoint) => void;
  onPickLocation: () => void;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<YMapInstance | null>(null);
  const placemarkRef = useRef<YPlacemarkInstance | null>(null);
  const initialLocationRef = useRef<LocationPoint | null>(location);
  const onSelectLocationRef = useRef(onSelectLocation);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    onSelectLocationRef.current = onSelectLocation;
  }, [onSelectLocation]);

  useEffect(() => {
    initialLocationRef.current = location;
  }, [location]);

  useEffect(() => {
    let cancelled = false;

    const initializeMap = () => {
      const ymaps = getYMaps();
      if (!ymaps || !mapContainerRef.current || cancelled) {
        return;
      }

      ymaps.ready(() => {
        if (cancelled || !mapContainerRef.current) {
          return;
        }
        if (mapRef.current) {
          return;
        }

        const initialLocation = initialLocationRef.current;
        const initialCoords: [number, number] = initialLocation
          ? [initialLocation.latitude, initialLocation.longitude]
          : [41.3111, 69.2797];

        const map = new ymaps.Map(
          mapContainerRef.current,
          {
            center: initialCoords,
            zoom: initialLocation ? 15 : 12,
            controls: ["zoomControl"],
          },
          {
            suppressMapOpenBlock: true,
          },
        );

        map.events.add("click", (event) => {
          const coords = event.get("coords");
          if (!coords) {
            return;
          }

          if (!placemarkRef.current) {
            placemarkRef.current = new ymaps.Placemark(
              coords,
              {},
              { preset: "islands#greenDotIcon" },
            );
            map.geoObjects.add(placemarkRef.current);
          } else {
            placemarkRef.current.geometry.setCoordinates(coords);
          }

          onSelectLocationRef.current({
            latitude: coords[0],
            longitude: coords[1],
          });
        });

        if (initialLocation) {
          placemarkRef.current = new ymaps.Placemark(
            [initialLocation.latitude, initialLocation.longitude],
            {},
            { preset: "islands#greenDotIcon" },
          );
          map.geoObjects.add(placemarkRef.current);
        }

        mapRef.current = map;
      });
    };

    const loadScript = () => {
      if (getYMaps()) {
        initializeMap();
        return;
      }

      const id = "yandex-maps-sdk";
      let script = document.getElementById(id) as HTMLScriptElement | null;

      if (!script) {
        const lang = locale === "ru" ? "ru_RU" : "uz_UZ";
        const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;
        const apiKeyQuery = apiKey ? `&apikey=${apiKey}` : "";
        script = document.createElement("script");
        script.id = id;
        script.src = `https://api-maps.yandex.ru/2.1/?lang=${lang}${apiKeyQuery}`;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }

      script.addEventListener("load", initializeMap);
      script.addEventListener("error", () => setMapError(true));

      return () => {
        script?.removeEventListener("load", initializeMap);
      };
    };

    const cleanupScriptListeners = loadScript();

    return () => {
      cancelled = true;
      cleanupScriptListeners?.();
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
        placemarkRef.current = null;
      }
    };
  }, [locale]);

  useEffect(() => {
    if (!location || !mapRef.current) {
      return;
    }

    const ymaps = getYMaps();
    if (!ymaps) {
      return;
    }

    const coords: [number, number] = [location.latitude, location.longitude];
    if (!placemarkRef.current) {
      placemarkRef.current = new ymaps.Placemark(
        coords,
        {},
        { preset: "islands#greenDotIcon" },
      );
      mapRef.current.geoObjects.add(placemarkRef.current);
    } else {
      placemarkRef.current.geometry.setCoordinates(coords);
    }
    mapRef.current.setCenter(coords, 15, { duration: 250 });
  }, [location]);

  return (
    <div className="rounded-2xl bg-surface-soft p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-app-muted">{hint}</p>
      <div
        ref={mapContainerRef}
        className="mt-3 h-52 w-full overflow-hidden rounded-2xl border border-surface-accent bg-surface"
      />
      {location ? (
        <p className="mt-2 text-xs text-brand-strong">
          {pickedLabel}: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
        </p>
      ) : null}
      {mapError ? <p className="mt-2 text-xs text-danger">{hint}</p> : null}
      <Button variant="soft" className="mt-3" type="button" onClick={onPickLocation}>
        {actionLabel}
      </Button>
    </div>
  );
}
